'use client'

import { useEffect, useState, useCallback } from 'react'
import { CardFlip } from '@/components/flashcards/CardFlip'

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

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const loadCards = useCallback(async () => {
    const res = await fetch('/api/flashcards')
    const data = await res.json()
    setCards(data)
    setCurrentIndex(0)
    setRevealed(false)
    setReviewed(0)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  const handleRate = async (quality: number) => {
    const card = cards[currentIndex]
    if (!card) return

    await fetch('/api/flashcards/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcardId: card.id, quality }),
    })

    setReviewed((prev) => prev + 1)
    setRevealed(false)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      loadCards()
    }
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <p className="text-gray-500">
          {cards.length > 0
            ? `${cards.length - currentIndex} cards remaining in queue`
            : 'No due flashcards. Review more content or add new cards.'}
          {reviewed > 0 && ` — ${reviewed} reviewed this session`}
        </p>
      </div>

      {currentCard ? (
        <CardFlip card={currentCard} onRate={handleRate} revealed={revealed} />
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          No flashcards due. Study more content to generate new cards.
        </div>
      )}
    </div>
  )
}
