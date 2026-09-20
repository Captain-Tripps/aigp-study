'use client'

import { useState } from 'react'

export interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  source: string
  difficulty: string
  examDomain: { romanNumeral: string; title: string }
  trainingModule: { number: number; title: string } | null
  performanceIndicator: { code: string; description: string } | null
}

export function QuestionCard({
  question,
  onAnswer,
}: {
  question: Question
  onAnswer: (selectedIndex: number) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (index: number) => {
    setSelected(index)
    setRevealed(true)
    onAnswer(index)
  }

  const optionClass = (index: number) => {
    if (!revealed) {
      return selected === index
        ? 'bg-clay-primary/10 text-clay-primary shadow-[inset_0_2px_4px_rgba(59,130,246,0.15)]'
        : 'hover:bg-clay-primary/5'
    }
    if (index === question.correctAnswer) return 'bg-clay-success/10 text-clay-success'
    if (index === selected) return 'bg-clay-danger/10 text-clay-danger'
    return 'opacity-60'
  }

  return (
    <div className="clay-card">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded bg-clay-text/5 px-1.5 py-0.5 text-clay-text/70">
          Domain {question.examDomain.romanNumeral}
        </span>
        {question.trainingModule && (
          <span className="rounded bg-clay-text/5 px-1.5 py-0.5 text-clay-text/70">
            M{question.trainingModule.number}
          </span>
        )}
        <span className={`rounded px-1.5 py-0.5 ${
          question.difficulty === 'easy' ? 'bg-clay-success/10 text-clay-success' :
          question.difficulty === 'medium' ? 'bg-clay-warning/10 text-clay-warning' :
          'bg-clay-danger/10 text-clay-danger'
        }`}>
          {question.difficulty}
        </span>
      </div>

      <p className="mb-4 text-sm font-medium text-clay-text">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={revealed}
            className={`w-full rounded-clay-sm border-0 bg-white p-3 text-left text-sm transition-colors ${optionClass(i)}`}
          >
            <span className="mr-2 font-mono text-xs text-clay-text/30">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="mt-4 rounded-clay-sm bg-clay-primary/5 p-4 text-sm">
          <p className="font-medium text-clay-text">
            {selected === question.correctAnswer ? 'Correct' : 'Incorrect'}
          </p>
          <p className="mt-1 text-clay-text/70">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
