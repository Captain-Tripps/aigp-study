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
    { label: 'Again', quality: 0, color: '!bg-clay-danger' },
    { label: 'Hard', quality: 3, color: '!bg-clay-warning' },
    { label: 'Good', quality: 4, color: '!bg-clay-success' },
    { label: 'Easy', quality: 5, color: '!bg-clay-primary' },
  ]

  return (
    <div className="space-y-4">
      <div className="clay-card">
        <p className="text-xs text-clay-text/30">
          {card.performanceIndicator.code} — {card.performanceIndicator.description}
        </p>
        <div className="mt-3 min-h-[100px]">
          <p className="text-lg font-medium text-clay-text">
            {revealed ? card.back : card.front}
          </p>
        </div>
      </div>

      {!revealed ? (
        <button
          onClick={flip}
          className="clay-btn w-full !py-3"
        >
          Flip
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {ratings.map((r) => (
            <button
              key={r.quality}
              onClick={() => onRate(r.quality)}
              className={`clay-btn ${r.color}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
