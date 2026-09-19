import { describe, it, expect } from 'vitest'
import { extractContentChunks } from '../content-extractor'
import { StructureMarker } from '../pdf-parser-types'

const mockMarkers: StructureMarker[] = [
  { type: 'domain', level: 1, code: 'I', title: 'Foundations', pageNumber: 1 },
  { type: 'competency', level: 2, code: 'I.A', title: 'Define AI', pageNumber: 5 },
  { type: 'performance-indicator', level: 3, code: 'I.A.1', title: 'Define artificial intelligence.', pageNumber: 5 },
  { type: 'performance-indicator', level: 3, code: 'I.A.2', title: 'Explain machine learning.', pageNumber: 6 },
]

describe('extractContentChunks', () => {
  it('should extract content between markers', () => {
    const text = `
AIGP Domain I: Foundations of AI Governance

AIGP Domain I: Competencies and Performance indicators
Competency: (I.A)
Define AI
Performance Indicators
● Define artificial intelligence.
Artificial intelligence refers to the simulation of human intelligence by machines.

● Explain machine learning.
Machine learning is a subset of AI that enables systems to learn from data.
`
    const chunks = extractContentChunks(mockMarkers, text)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    const ia1 = chunks.find((c) => c.title === 'Define artificial intelligence.')
    expect(ia1).toBeDefined()
    expect(ia1!.content).toContain('simulation of human intelligence')
    const ia2 = chunks.find((c) => c.title === 'Explain machine learning.')
    expect(ia2).toBeDefined()
    expect(ia2!.content).toContain('learn from data')
  })

  it('should classify content types', () => {
    const text = `
AIGP Domain I: Competencies and Performance indicators
Competency: (I.A)
Define AI
Performance Indicators
● Define artificial intelligence.
**Definition:** AI refers to machine intelligence.
`
    const markers: StructureMarker[] = [
      { type: 'performance-indicator', level: 3, code: 'I.A.1', title: 'Define artificial intelligence.', pageNumber: 5 },
    ]
    const chunks = extractContentChunks(markers, text)
    expect(chunks.length).toBe(1)
    expect(chunks[0].type).toBe('definition')
  })
})
