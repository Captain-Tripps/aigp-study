'use client'

import { useState } from 'react'

interface Flashcard {
  id: number
  front: string
  back: string
  easeFactor: number
  interval: number
  nextReviewDate: Date | null
  reviewCount: number
  performanceIndicator: { code: string; description: string }
}

export function CardFlip({
  card,
  onRate,
  revealed: initialRevealed,
}: {
  card: Flashcard
  onRate: (quality: number) => void
  revealed?: boolean
}) {
  const [revealed, setRevealed] = useState(initialRevealed || false)

  const flip = () => setRevealed(!revealed)

  const ratings = [
    { label: 'Again', quality: 0, color: 'bg-red-500' },
    { label: 'Hard', quality: 3, color: 'bg-yellow-500' },
    { label: 'Good', quality: 4, color: 'bg-green-500' },
    { label: 'Easy', quality: 5, color: 'bg-blue-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-xs text-gray-400">
          {card.performanceIndicator.code} — {card.performanceIndicator.description}
        </p>
        <div className="mt-3 min-h-[100px]">
          <p className="text-lg font-medium text-gray-900">
            {revealed ? card.back : card.front}
          </p>
        </div>
      </div>

      {!revealed ? (
        <button
          onClick={flip}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Flip
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {ratings.map((r) => (
            <button
              key={r.quality}
              onClick={() => onRate(r.quality)}
              className={`rounded-lg py-3 text-sm font-medium text-white ${r.color}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
