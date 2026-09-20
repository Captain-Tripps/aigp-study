import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sm2, calculateDueDate } from '@/lib/srs'

export async function POST(req: Request) {
  const { flashcardId, quality } = await req.json()

  if (!flashcardId || quality === undefined) {
    return NextResponse.json({ error: 'flashcardId and quality required' }, { status: 400 })
  }

  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } })
  if (!card) {
    return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
  }

  const result = sm2(card.easeFactor, card.interval, quality)
  const dueDate = calculateDueDate(result.interval)

  await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      easeFactor: result.easeFactor,
      interval: result.interval,
      nextReviewDate: dueDate,
      reviewCount: { increment: 1 },
    },
  })

  return NextResponse.json({
    flashcardId,
    easeFactor: result.easeFactor,
    interval: result.interval,
    nextReviewDate: dueDate,
  })
}
