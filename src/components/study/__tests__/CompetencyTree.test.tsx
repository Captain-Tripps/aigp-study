// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompetencyTree } from '../CompetencyTree'
import type { CompetencyDetail } from '@/types/study'

const mockCompetencies: CompetencyDetail[] = [
  {
    id: 1,
    code: 'I.A',
    title: 'Define AI and ML',
    description: 'Covers fundamental concepts',
    performanceIndicators: [
      { id: 1, code: 'I.A.1', description: 'Define AI', chunks: [], progress: { status: 'done', confidence: 4 } },
      { id: 2, code: 'I.A.2', description: 'Explain ML', chunks: [], progress: null },
    ],
  },
]

describe('CompetencyTree', () => {
  it('should render competency code and title', () => {
    render(<CompetencyTree competencies={mockCompetencies} selectedPI={null} onSelectPI={() => {}} />)
    expect(screen.getByText('I.A')).toBeInTheDocument()
    expect(screen.getByText('Define AI and ML')).toBeInTheDocument()
  })

  it('should show PI count', () => {
    render(<CompetencyTree competencies={mockCompetencies} selectedPI={null} onSelectPI={() => {}} />)
    expect(screen.getByText('2 PIs')).toBeInTheDocument()
  })
})
