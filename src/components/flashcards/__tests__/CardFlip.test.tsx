// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardFlip } from '../CardFlip'

type Flashcard = Parameters<typeof CardFlip>[0]['card']

const mockCard: Flashcard = {
  id: 1,
  front: 'What is AI?',
  back: 'Artificial Intelligence is...',
  easeFactor: 2.5,
  interval: 0,
  nextReviewDate: null,
  reviewCount: 0,
  performanceIndicator: { code: 'I.A.1', description: 'Define AI' },
}

describe('CardFlip', () => {
  it('should show front face initially', () => {
    render(<CardFlip card={mockCard} onRate={() => {}} />)
    expect(screen.getByText('What is AI?')).toBeInTheDocument()
  })

  it('should reveal back face on flip', () => {
    render(<CardFlip card={mockCard} onRate={() => {}} />)
    fireEvent.click(screen.getByText('Flip'))
    expect(screen.getByText('Artificial Intelligence is...')).toBeInTheDocument()
  })

  it('should call onRate when rating', () => {
    const onRate = vi.fn()
    render(<CardFlip card={mockCard} onRate={onRate} revealed={true} />)
    fireEvent.click(screen.getByText('Good'))
    expect(onRate).toHaveBeenCalledWith(4)
  })
})
