import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.json()
  const { performanceIndicatorId, type, title, content, sourceType, sourceUrl } = body

  if (!performanceIndicatorId || !type || !title || !content) {
    return NextResponse.json(
      { error: 'performanceIndicatorId, type, title, and content required' },
      { status: 400 }
    )
  }

  const pi = await prisma.performanceIndicator.findUnique({
    where: { id: performanceIndicatorId },
  })
  if (!pi) {
    return NextResponse.json({ error: 'Performance indicator not found' }, { status: 404 })
  }

  const chunk = await prisma.contentChunk.create({
    data: {
      performanceIndicatorId,
      type,
      title,
      content,
      sourceType: sourceType || 'manual',
      sourceUrl: sourceUrl || null,
      sourcePage: null,
    },
  })

  return NextResponse.json(chunk)
}
