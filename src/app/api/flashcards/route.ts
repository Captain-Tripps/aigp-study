import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10) || 50)
  )
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
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return NextResponse.json(cards)
}
