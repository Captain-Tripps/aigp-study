import { describe, it, expect } from 'vitest'
import { detectStructure } from '../structure-detector'

describe('detectStructure', () => {
  it('should detect domain markers', () => {
    const text = `
AIGP Domain I: Foundations of AI
Domain I – "Understanding the Foundations of Artificial Intelligence," defines AI and ML.

AIGP Domain I: Competencies and Performance indicators
Competency: (I.A)
Understand the basic elements of AI and ML
Performance Indicators
● Understand widely accepted definitions of AI and ML.
● Understand common elements of AI/ML definitions.
`
    const markers = detectStructure(text, 5)
    expect(markers.length).toBeGreaterThanOrEqual(3)
    const domain = markers.find((m) => m.type === 'domain')
    expect(domain).toBeDefined()
    expect(domain!.code).toBe('I')
    expect(domain!.title).toBe('Foundations of AI')
    const comp = markers.find((m) => m.type === 'competency')
    expect(comp).toBeDefined()
    expect(comp!.code).toBe('I.A')
    expect(comp!.title).toBe('Understand the basic elements of AI and ML')
  })

  it('should detect competency markers', () => {
    const text = `
AIGP Domain II: Competencies and Performance indicators
Competency: (II.B)
Understand AI risks
Performance Indicators
● Core risks include bias, transparency issues.
`
    const markers = detectStructure(text, 60)
    const comp = markers.find((m) => m.type === 'competency')
    expect(comp).toBeDefined()
    expect(comp!.code).toBe('II.B')
    expect(comp!.title).toBe('Understand AI risks')
  })

  it('should detect performance indicator markers', () => {
    const text = `
AIGP Domain I: Competencies and Performance indicators
Competency: (I.A)
Understand the basic elements of AI and ML
Performance Indicators
● Define artificial intelligence.
● Differentiate between narrow and general AI.
`
    const markers = detectStructure(text, 5)
    const pis = markers.filter((m) => m.type === 'performance-indicator')
    expect(pis.length).toBe(2)
    expect(pis[0].code).toBe('I.A.1')
    expect(pis[1].code).toBe('I.A.2')
    expect(pis[0].title).toBe('Define artificial intelligence.')
  })

  it('should handle multiple domains in sequence', () => {
    const text = `
AIGP Domain I: Foundations
Content...

AIGP Domain II: AI Impacts
More content...

AIGP Domain II: Competencies and Performance indicators
Competency: (II.A)
Risk assessment
Performance Indicators
● Identify risks.
`
    const markers = detectStructure(text, 1)
    const domains = markers.filter((m) => m.type === 'domain')
    expect(domains.length).toBe(2)
    expect(domains[0].code).toBe('I')
    expect(domains[1].code).toBe('II')
  })

  it('should track page numbers from page markers', () => {
    const text = `
AIGP Domain I: Foundations of AI

-- 5 of 232 --

AIGP Domain I: Competencies and Performance indicators
Competency: (I.A)
Understand the basic elements of AI and ML
Performance Indicators
● Define AI.

-- 6 of 232 --

● Define ML.
`
    const markers = detectStructure(text, 1)
    const domain = markers.find((m) => m.type === 'domain')
    expect(domain!.pageNumber).toBe(1)
    const comp = markers.find((m) => m.type === 'competency')
    expect(comp!.pageNumber).toBe(5)
    const pis = markers.filter((m) => m.type === 'performance-indicator')
    expect(pis[0].pageNumber).toBe(5)
    expect(pis[1].pageNumber).toBe(6)
  })
})
