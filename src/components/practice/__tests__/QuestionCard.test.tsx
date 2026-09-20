// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard, type Question } from '../QuestionCard'

const mockQuestion: Question = {
  id: 1,
  text: 'What is AI?',
  options: ['A machine that learns', 'A robot', 'A database', 'A network'],
  correctAnswer: 0,
  explanation: 'AI is a field of CS that creates intelligent machines.',
  source: 'manual',
  difficulty: 'easy',
  examDomain: { romanNumeral: 'I', title: 'Foundations' },
  trainingModule: { number: 1, title: 'Foundations of AI' },
  performanceIndicator: null,
}

describe('QuestionCard', () => {
  it('should render question text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={() => {}} />)
    expect(screen.getByText('What is AI?')).toBeInTheDocument()
  })

  it('should render all options', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={() => {}} />)
    expect(screen.getByText('A machine that learns')).toBeInTheDocument()
    expect(screen.getByText('A robot')).toBeInTheDocument()
  })

  it('should call onAnswer when option selected', () => {
    const onAnswer = vi.fn()
    render(<QuestionCard question={mockQuestion} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('A machine that learns'))
    expect(onAnswer).toHaveBeenCalledWith(0)
  })
})
