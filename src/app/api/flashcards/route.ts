import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const cards = await prisma.flashcard.findMany({
    include: {
      performanceIndicator: { select: { code: true, description: true } },
    },
    where: {
      OR: [
        { nextReviewDate: null },
        { nextReviewDate: { lte: now } },
      ],
    },
    orderBy: { nextReviewDate: 'asc' },
  })

  return NextResponse.json(cards)
}
