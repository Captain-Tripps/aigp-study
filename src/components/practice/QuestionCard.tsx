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
        ? 'border-indigo-500 bg-indigo-50'
        : 'border-gray-200 hover:border-gray-300'
    }
    if (index === question.correctAnswer) return 'border-green-500 bg-green-50'
    if (index === selected) return 'border-red-500 bg-red-50'
    return 'border-gray-200'
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
          Domain {question.examDomain.romanNumeral}
        </span>
        {question.trainingModule && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
            M{question.trainingModule.number}
          </span>
        )}
        <span className={`rounded px-1.5 py-0.5 ${
          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {question.difficulty}
        </span>
      </div>

      <p className="mb-4 text-sm font-medium text-gray-900">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={revealed}
            className={`w-full rounded border p-3 text-left text-sm transition-colors ${optionClass(i)}`}
          >
            <span className="mr-2 font-mono text-xs text-gray-400">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">
            {selected === question.correctAnswer ? 'Correct' : 'Incorrect'}
          </p>
          <p className="mt-1 text-gray-600">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
