// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompetencyMatrix } from '../CompetencyMatrix'
import type { DomainCompetency } from '@/types/domain'

const mockCompetencies: DomainCompetency[] = [
  {
    code: 'I.A',
    title: 'Define AI',
    moduleNumber: 1,
    pis: [
      { code: 'I.A.1', description: 'Define AI', status: 'done', confidence: 4 },
      { code: 'I.A.2', description: 'Explain ML', status: 'not_started', confidence: 0 },
    ],
  },
]

describe('CompetencyMatrix', () => {
  it('should render competency rows', () => {
    render(<CompetencyMatrix competencies={mockCompetencies} />)
    expect(screen.getByText('I.A')).toBeInTheDocument()
    expect(screen.getByText('Define AI')).toBeInTheDocument()
  })

  it('should show PI status indicators', () => {
    render(<CompetencyMatrix competencies={mockCompetencies} />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })
})
