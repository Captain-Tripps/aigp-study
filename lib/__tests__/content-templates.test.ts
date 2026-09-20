import { describe, it, expect } from 'vitest'
import { buildCompetencyContent, CompetencyContentParams } from '../content-templates'

describe('buildCompetencyContent', () => {
  const mockParams: CompetencyContentParams = {
    competencyCode: 'I.A',
    title: 'Understand the basic elements of AI and ML',
    summary: 'AI is the broad field of building intelligent systems. ML is a subset where systems learn from data.',
    terms: [
      { term: 'Artificial Intelligence', definition: 'The umbrella field aimed at creating systems capable of tasks requiring human intelligence.' },
      { term: 'Machine Learning', definition: 'A method of achieving AI where a system learns patterns from data.' },
    ],
    concepts: [
      { name: 'AI is the goal, ML is a method', explanation: 'Not all AI uses ML, but most modern regulated systems do.' },
    ],
    misconceptions: [
      { misconception: 'AI and ML are interchangeable', correction: 'ML is a subset of AI, not a synonym.' },
    ],
    questions: [
      {
        stem: 'Which best describes the relationship between AI and ML?',
        options: ['AI and ML are synonymous', 'ML contains AI', 'ML is a subset of AI', 'AI only uses neural networks'],
        answer: 'C',
        rationale: 'ML is one approach to achieving AI, specifically learning from data.',
      },
    ],
  }

  it('should produce valid Markdown with all 5 sections', () => {
    const result = buildCompetencyContent(mockParams)
    expect(result).toContain('# I.A: Understand the basic elements of AI and ML')
    expect(result).toContain('## Plain-Language Summary')
    expect(result).toContain('## Key Terms')
    expect(result).toContain('## Core Concepts')
    expect(result).toContain('## Common Exam Misconceptions')
    expect(result).toContain('## Practice Questions')
  })

  it('should include all glossary terms in bold', () => {
    const result = buildCompetencyContent(mockParams)
    expect(result).toContain('**Artificial Intelligence:**')
    expect(result).toContain('**Machine Learning:**')
  })

  it('should format practice questions with lettered options', () => {
    const result = buildCompetencyContent(mockParams)
    expect(result).toContain('A. AI and ML are synonymous')
    expect(result).toContain('B. ML contains AI')
    expect(result).toContain('C. ML is a subset of AI')
    expect(result).toContain('D. AI only uses neural networks')
    expect(result).toContain('Answer: C')
  })

  it('should number core concepts', () => {
    const result = buildCompetencyContent(mockParams)
    expect(result).toContain('1. **AI is the goal, ML is a method.**')
  })
})
