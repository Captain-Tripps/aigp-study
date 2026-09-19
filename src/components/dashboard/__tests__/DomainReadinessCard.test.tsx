// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DomainReadinessCard } from '../DomainReadinessCard'

const mockDomain = {
  id: 1,
  romanNumeral: 'I',
  title: 'Foundations of AI Governance',
  weightMin: 16,
  weightMax: 20,
  readiness: 75,
  completedPis: 15,
  totalPis: 20,
  avgConfidence: 3.5,
}

describe('DomainReadinessCard', () => {
  it('should render domain title and weight', () => {
    render(<DomainReadinessCard domain={mockDomain} />)
    expect(screen.getByText('Foundations of AI Governance')).toBeInTheDocument()
    expect(screen.getByText('16-20%')).toBeInTheDocument()
  })

  it('should display readiness percentage', () => {
    render(<DomainReadinessCard domain={mockDomain} />)
    expect(screen.getByText('75% ready')).toBeInTheDocument()
  })

  it('should show completed vs total PIs', () => {
    render(<DomainReadinessCard domain={mockDomain} />)
    expect(screen.getByText('15/20 PIs')).toBeInTheDocument()
  })
})
