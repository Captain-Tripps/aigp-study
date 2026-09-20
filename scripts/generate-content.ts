import { prisma } from '../lib/prisma'
import { buildCompetencyContent, CompetencyContentParams } from '../lib/content-templates'

const LO_VERBS = [
  'understand', 'explain', 'describe', 'identify', 'analyze', 'evaluate',
  'apply', 'assess', 'recognize', 'compare', 'discuss', 'determine',
  'differentiate', 'interpret', 'examine', 'implement', 'establish',
  'map', 'plan', 'scope', 'test', 'validate', 'manage', 'monitor', 'ensure', 'integrate',
]

function isLearningObjective(description: string): boolean {
  const firstWord = description.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
  return LO_VERBS.includes(firstWord)
}

interface LLMResponse {
  summary: string
  terms: { term: string; definition: string }[]
  concepts: { name: string; explanation: string }[]
  misconceptions: { misconception: string; correction: string }[]
  questions: { stem: string; options: string[]; answer: string; rationale: string }[]
}

function buildPrompt(competencyCode: string, title: string, los: string[], cds: string[]): string {
  return `You are an expert on the IAPP AIGP (AI Governance Professional) certification exam.

Generate study content for this learning competency:
- Code: ${competencyCode}
- Title: ${title}

Learning Objectives (PIs starting with action verbs):
${los.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Supporting Content Details (definitions, examples, sub-points):
${cds.slice(0, 20).map((c) => `- ${c}`).join('\n')}

Return JSON with exactly these fields:
{
  "summary": "2-4 paragraphs in plain language for a non-technical privacy professional. No jargon without explanation.",
  "terms": [{"term": "Key Term", "definition": "1-sentence definition aligned with IAPP AIGP framing"}],
  "concepts": [{"name": "Concept Name", "explanation": "2-3 sentence plain-language explanation"}],
  "misconceptions": [{"misconception": "Common wrong belief", "correction": "Why it's wrong and what the exam expects"}],
  "questions": [{"stem": "Question text", "options": ["A text", "B text", "C text", "D text"], "answer": "C", "rationale": "one-line why"}]
}

Counts: 8-15 terms, 3-6 concepts, 2-4 misconceptions, exactly 4 questions.

Rules:
- Align definitions with IAPP AIGP framing, not generic ML terminology
- Questions should test understanding, not memorization
- Include at least one question that addresses a common misconception
- Keep all text concise and exam-focused
- Respond with the JSON object only — no markdown, no code fences, no commentary`
}

const LLM_URL = process.env.LLM_URL || 'http://localhost:8080/v1/chat/completions'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-oss-120b'

async function callLLM(prompt: string): Promise<LLMResponse> {
  const res = await fetch(LLM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: 'You are an expert on the IAPP AIGP certification exam. You always respond with valid JSON only — no markdown, no code fences, no commentary.' },
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

// Some LLMs emit literal newlines inside JSON string values, which breaks
// JSON.parse. This escape pass fixes only the control characters that
// appear *between* quotes (i.e. inside strings) — structural newlines
// between tokens are left alone.
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
      // Replace raw control chars that are illegal inside a JSON string
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

async function main() {
  const competencies = await prisma.competency.findMany({
    include: {
      performanceIndicators: { orderBy: { code: 'asc' } },
    },
    orderBy: { code: 'asc' },
  })

  console.log(`Processing ${competencies.length} competencies...`)

  for (let i = 0; i < competencies.length; i++) {
    const comp = competencies[i]
    const los: string[] = []
    const cds: string[] = []

    for (const pi of comp.performanceIndicators) {
      if (isLearningObjective(pi.description)) {
        los.push(pi.description)
      } else {
        cds.push(pi.description)
      }
    }

    console.log(`[${i + 1}/${competencies.length}] ${comp.code}: ${comp.title} (${los.length} LOs, ${cds.length} CDs)`)

    const existing = await prisma.contentChunk.findFirst({
      where: {
        sourceType: 'manual',
        title: comp.code,
      },
    })
    if (existing) {
      console.log(`  SKIP — content already exists (id=${existing.id})`)
      continue
    }

    try {
      const prompt = buildPrompt(comp.code, comp.title, los, cds)
      const llmResponse = await callLLM(prompt)

      const params: CompetencyContentParams = {
        competencyCode: comp.code,
        title: comp.title,
        summary: llmResponse.summary,
        terms: llmResponse.terms,
        concepts: llmResponse.concepts,
        misconceptions: llmResponse.misconceptions,
        questions: llmResponse.questions,
      }

      const content = buildCompetencyContent(params)

      const firstPI = comp.performanceIndicators[0]
      if (!firstPI) {
        console.log(`  SKIP — no PIs to link to`)
        continue
      }

      await prisma.contentChunk.create({
        data: {
          title: comp.code,
          content,
          sourceType: 'manual',
          type: 'manual',
          performanceIndicatorId: firstPI.id,
          isEdited: true,
        },
      })

      console.log(`  OK — ${content.length} chars stored (linked to PI ${firstPI.code})`)
    } catch (err) {
      console.error(`  ERROR: ${err instanceof Error ? err.message : err}`)
    }

    if (i < competencies.length - 1) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const total = await prisma.contentChunk.count({ where: { sourceType: 'manual' } })
  console.log(`\nDone. Total manual content chunks: ${total}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
