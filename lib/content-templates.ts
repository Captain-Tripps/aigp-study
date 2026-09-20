export interface GlossaryTerm {
  term: string
  definition: string
}

export interface CoreConcept {
  name: string
  explanation: string
}

export interface Misconception {
  misconception: string
  correction: string
}

export interface PracticeQuestion {
  stem: string
  options: string[]
  answer: string
  rationale: string
}

export interface CompetencyContentParams {
  competencyCode: string
  title: string
  summary: string
  terms: GlossaryTerm[]
  concepts: CoreConcept[]
  misconceptions: Misconception[]
  questions: PracticeQuestion[]
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function buildCompetencyContent(p: CompetencyContentParams): string {
  const sections: string[] = []

  sections.push(`# ${p.competencyCode}: ${p.title}`)

  sections.push(`## Plain-Language Summary\n\n${p.summary}`)

  const termLines = p.terms.map((t) => `**${t.term}:** ${t.definition}`)
  sections.push(`## Key Terms\n\n${termLines.join('\n')}`)

  const conceptLines = p.concepts.map(
    (c, i) => `${i + 1}. **${c.name}.** ${c.explanation}`
  )
  sections.push(`## Core Concepts\n\n${conceptLines.join('\n')}`)

  const misconLines = p.misconceptions.map(
    (m) => `- **${m.misconception}:** ${m.correction}`
  )
  sections.push(`## Common Exam Misconceptions\n\n${misconLines.join('\n')}`)

  const questionBlocks = p.questions.map((q, i) => {
    const opts = q.options.map((o, j) => `${LETTERS[j]}. ${o}`).join('\n')
    return `**${i + 1}. ${q.stem}**\n${opts}\n\nAnswer: ${q.answer} — ${q.rationale}`
  })
  sections.push(`## Practice Questions\n\n${questionBlocks.join('\n\n')}`)

  return sections.join('\n\n')
}
