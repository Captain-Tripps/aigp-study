/**
 * Per-PI content generation — source-grounded.
 *
 * Unlike the original version (which told the LLM to "reference" the
 * AIGP Playbook URL — a URL it cannot actually read), this version injects
 * the actual Playbook article content relevant to each PI into the prompt.
 * This is what produces deep, exam-focused study material instead of
 * generic summaries.
 *
 * Usage:
 *   npx tsx scripts/generate-content-per-pi.ts              # live
 *   npx tsx scripts/generate-content-per-pi.ts --dry-run    # no writes
 *   npx tsx scripts/generate-content-per-pi.ts --overwrite  # regenerate existing chunks
 */
import { prisma } from '../lib/prisma'
import { buildSourceGrounding, sourceCharCount, PI_SOURCES } from './playbook-content'

const LLM_URL = process.env.LLM_URL || 'http://100.125.83.77:8080/v1/chat/completions'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-oss-120b'

const DRY_RUN = process.argv.includes('--dry-run')
const OVERWRITE = process.argv.includes('--overwrite')
const DELAY_MS = 1500

// --only CODE[,CODE2,...] to generate only specific PIs
const onlyFlag = process.argv.indexOf('--only')
const ONLY_CODES: string[] | null =
  onlyFlag !== -1 && process.argv[onlyFlag + 1]
    ? process.argv[onlyFlag + 1].split(',')
    : null

interface LLMResponse {
  summary: string
  keyConcepts: string
  terms: { term: string; definition: string }[]
  misconceptions: { misconception: string; correction: string }[]
  scenario: string
  question: { stem: string; options: string[]; answer: string; rationale: string }
}

function buildPrompt(
  piCode: string,
  piDescription: string,
  competencyCode: string,
  competencyTitle: string,
  moduleTitle: string,
): string {
  const grounding = buildSourceGrounding(piCode)

  return `You are an expert on the IAPP AIGP (AI Governance Professional) certification exam.

Generate DEEP, exam-focused study content for this specific Performance Indicator:
- PI Code: ${piCode}
- PI Description: ${piDescription}
- Competency: ${competencyCode} — ${competencyTitle}
- Module: ${moduleTitle}

GROUNDING: The content below is extracted from the AIGP Playbook (aigpplaybook.com), a practitioner-built study resource. Use it as your primary source. Extract specific details, examples, obligations, frameworks, and exam tips from this material. Do NOT produce generic summaries — produce specific, actionable study content that a candidate can use to pass the exam.

${grounding}

Return JSON with exactly these fields:
{
  "summary": "3-4 paragraphs in plain language for a non-technical privacy professional. Cover: (1) what this PI requires and why it matters for the exam, (2) the specific frameworks, regulations, or practices that apply, with concrete details from the source material, (3) how this PI connects to adjacent PIs and the broader exam domain. No jargon without explanation.",
  "keyConcepts": "2-4 bullet points (each starting with '- ') highlighting the most exam-critical specifics from the source material: exact obligations, specific risk tiers, named framework functions, concrete deadlines, or distinctions that scenario questions test. Each bullet should be 1-2 sentences of dense, specific content.",
  "terms": [{"term": "Key Term", "definition": "1-2 sentence definition with specific detail (e.g., 'the 10^25 FLOPs threshold' not just 'a high compute threshold'). Align with IAPP AIGP framing and AIGP Playbook terminology."}],
  "misconceptions": [{"misconception": "Common wrong belief", "correction": "Why it's wrong, what the exam expects, and the specific detail that distinguishes right from wrong"}],
  "scenario": "A 2-3 sentence realistic scenario that a candidate might encounter on the exam, grounded in the specific context of this PI. This is NOT the practice question — it is a standalone scenario that illustrates the PI in practice.",
  "question": {"stem": "Question text", "options": ["A text", "B text", "C text", "D text"], "answer": "C", "rationale": "2-3 sentence explanation of why the correct answer is right and why each distractor is wrong, referencing specific details from the source material"}
}

Counts: 4-6 terms, 2-3 misconceptions, exactly 1 question.

Rules:
- Focus specifically on THIS PI, not the whole competency
- Use the specific details from the grounding material: exact obligations, named functions, specific thresholds, concrete examples
- The question should test understanding of this specific PI through a scenario, not memorization
- Distinguish this PI from adjacent PIs where they are easily confused
- Keep all text exam-focused and actionable
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
      max_tokens: 8192,
      messages: [
        {
          role: 'system',
          content:
            `You are an expert on the IAPP AIGP certification exam. You produce deep, specific, exam-focused study content grounded in the AIGP Playbook source material provided in each prompt. You always respond with valid JSON only — no markdown, no code fences, no commentary.`,
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

  sections.push(`## Key Exam Concepts\n\n${r.keyConcepts}`)

  const termLines = r.terms.map((t) => `**${t.term}:** ${t.definition}`)
  sections.push(`## Key Terms\n\n${termLines.join('\n')}`)

  const misconLines = r.misconceptions.map(
    (m) => `- **${m.misconception}:** ${m.correction}`,
  )
  sections.push(`## Common Exam Misconceptions\n\n${misconLines.join('\n')}`)

  sections.push(`## Real-World Scenario\n\n${r.scenario}`)

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

  // Filter to specific PIs if --only is provided
  let filtered = pis
  if (ONLY_CODES) {
    filtered = pis.filter((p) => ONLY_CODES.includes(p.code))
    const missing = ONLY_CODES.filter((c) => !pis.find((p) => p.code === c))
    if (missing.length > 0) {
      console.log(`WARNING: PI codes not found: ${missing.join(', ')}`)
    }
  }

  const total = filtered.length
  const alreadyDone = filtered.filter((p) => p.contentChunks.length > 0).length
  console.log(`Found ${total} PIs. ${alreadyDone} already have content.`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}${OVERWRITE ? ' (overwrite existing)' : ''}${ONLY_CODES ? ` (only: ${ONLY_CODES.join(', ')})` : ''}`)

  // Report source coverage
  const unmapped = pis.filter((p) => !PI_SOURCES[p.code])
  if (unmapped.length > 0) {
    console.log(`\nWARNING: ${unmapped.length} PIs have no source mapping:`)
    for (const p of unmapped) console.log(`  - ${p.code}`)
  }

  let ok = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < filtered.length; i++) {
    const pi = filtered[i]
    const code = pi.code

    if (pi.contentChunks.length > 0 && !OVERWRITE) {
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

    const srcChars = sourceCharCount(code)
    process.stdout.write(`[${i + 1}/${total}] ${code} (src: ${srcChars} chars) ... `)

    try {
      const response = await callLLM(prompt)
      const content = buildPIContent(response)

      if (!DRY_RUN) {
        if (pi.contentChunks.length > 0 && OVERWRITE) {
          // Update the existing chunk
          await prisma.contentChunk.update({
            where: { id: pi.contentChunks[0].id },
            data: { content, isEdited: true },
          })
        } else {
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
      }

      ok++
      console.log(`OK (${content.length} chars)`)
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${code}: ${msg}`)
      console.log(`ERROR: ${msg}`)
    }

    if (i < filtered.length - 1) {
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
