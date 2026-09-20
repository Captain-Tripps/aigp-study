import { prisma } from '../lib/prisma'

const LLM_URL = process.env.LLM_URL || 'http://localhost:8080/v1/chat/completions'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-oss-120b'

const DRY_RUN = process.argv.includes('--dry-run')
const DELAY_MS = 1000

interface LLMResponse {
  summary: string
  terms: { term: string; definition: string }[]
  misconceptions: { misconception: string; correction: string }[]
  question: { stem: string; options: string[]; answer: string; rationale: string }
}

function buildPrompt(
  piCode: string,
  piDescription: string,
  competencyCode: string,
  competencyTitle: string,
  moduleTitle: string,
): string {
  return `You are an expert on the IAPP AIGP (AI Governance Professional) certification exam.

Generate study content for this specific Performance Indicator:
- PI Code: ${piCode}
- PI Description: ${piDescription}
- Competency: ${competencyCode} — ${competencyTitle}
- Module: ${moduleTitle}

Return JSON with exactly these fields:
{
  "summary": "2-3 paragraphs in plain language for a non-technical privacy professional explaining this specific PI. No jargon without explanation.",
  "terms": [{"term": "Key Term", "definition": "1-sentence definition aligned with IAPP AIGP framing"}],
  "misconceptions": [{"misconception": "Common wrong belief", "correction": "Why it's wrong and what the exam expects"}],
  "question": {"stem": "Question text", "options": ["A text", "B text", "C text", "D text"], "answer": "C", "rationale": "one-line why"}
}

Counts: 3-5 terms, 1-2 misconceptions, exactly 1 question.

Rules:
- Focus specifically on this PI, not the whole competency
- Align definitions with IAPP AIGP framing, not generic ML terminology
- The question should test understanding of this specific PI, not memorization
- Keep all text concise and exam-focused
- Respond with the JSON object only — no markdown, no code fences, no commentary`
}

function stripCodeFences(text: string): string {
  let t = text.trim()
  t = t.replace(/^```(?:json)?\s*\n?/i, '')
  t = t.replace(/\n?\s*```\s*$/i, '')
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1)
  }
  return t.trim()
}

function escapeControlCharsInJsonStrings(json: string): string {
  let out = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < json.length; i++) {
    const ch = json[i]
    if (inString) {
      if (escaped) {
        out += ch
        escaped = false
        continue
      }
      if (ch === '\\') {
        out += ch
        escaped = true
        continue
      }
      if (ch === '"') {
        out += ch
        inString = false
        continue
      }
      if (ch === '\n') { out += '\\n'; continue }
      if (ch === '\r') { out += '\\r'; continue }
      if (ch === '\t') { out += '\\t'; continue }
      out += ch
    } else {
      if (ch === '"') {
        inString = true
      }
      out += ch
    }
  }
  return out
}

async function callLLM(prompt: string): Promise<LLMResponse> {
  const res = await fetch(LLM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert on the IAPP AIGP certification exam. You always respond with valid JSON only — no markdown, no code fences, no commentary.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LLM API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('LLM response had no content')
  }

  const cleaned = escapeControlCharsInJsonStrings(stripCodeFences(content))
  return JSON.parse(cleaned) as LLMResponse
}

function buildPIContent(r: LLMResponse): string {
  const sections: string[] = []

  sections.push(`## Plain-Language Summary\n\n${r.summary}`)

  const termLines = r.terms.map((t) => `**${t.term}:** ${t.definition}`)
  sections.push(`## Key Terms\n\n${termLines.join('\n')}`)

  const misconLines = r.misconceptions.map(
    (m) => `- **${m.misconception}:** ${m.correction}`,
  )
  sections.push(`## Common Exam Misconceptions\n\n${misconLines.join('\n')}`)

  const q = r.question
  const opts = q.options.map((o, j) => `${'ABCD'[j]}. ${o}`).join('\n')
  sections.push(
    `## Practice Question\n\n**${q.stem}**\n${opts}\n\nAnswer: ${q.answer} — ${q.rationale}`,
  )

  return sections.join('\n\n')
}

async function main() {
  const pis = await prisma.performanceIndicator.findMany({
    include: {
      competency: {
        include: { trainingModule: { select: { title: true } } },
      },
      contentChunks: true,
    },
    orderBy: { code: 'asc' },
  })

  const total = pis.length
  const alreadyDone = pis.filter((p) => p.contentChunks.length > 0).length
  console.log(`Found ${total} PIs. ${alreadyDone} already have content.`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`)

  let ok = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < pis.length; i++) {
    const pi = pis[i]
    const code = pi.code

    if (pi.contentChunks.length > 0) {
      skipped++
      continue
    }

    const moduleTitle = pi.competency.trainingModule.title
    const prompt = buildPrompt(
      code,
      pi.description,
      pi.competency.code,
      pi.competency.title,
      moduleTitle,
    )

    process.stdout.write(`[${i + 1}/${total}] ${code} ... `)

    try {
      const response = await callLLM(prompt)
      const content = buildPIContent(response)

      if (!DRY_RUN) {
        await prisma.contentChunk.create({
          data: {
            title: code,
            content,
            sourceType: 'manual',
            type: 'manual',
            performanceIndicatorId: pi.id,
            isEdited: true,
          },
        })
      }

      ok++
      console.log(`OK (${content.length} chars)`)
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${code}: ${msg}`)
      console.log(`ERROR: ${msg}`)
    }

    if (i < pis.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  console.log(`\nDone.`)
  console.log(`  OK:      ${ok}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Failed:  ${failed}`)
  if (errors.length > 0) {
    console.log(`\nErrors:`)
    for (const e of errors) {
      console.log(`  - ${e}`)
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
