import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { chunkId: string } }
) {
  const body = await req.json()
  const { type, title, content, sourceType, sourceUrl } = body

  if (!type || !title || !content) {
    return NextResponse.json({ error: 'type, title, and content required' }, { status: 400 })
  }

  const parentChunk = await prisma.contentChunk.findUnique({
    where: { id: parseInt(params.chunkId, 10) },
  })
  if (!parentChunk) {
    return NextResponse.json({ error: 'Parent chunk not found' }, { status: 404 })
  }

  const newChunk = await prisma.contentChunk.create({
    data: {
      performanceIndicatorId: parentChunk.performanceIndicatorId,
      type,
      title,
      content,
      sourceType: sourceType || 'manual',
      sourceUrl: sourceUrl || null,
      sourcePage: null,
    },
  })

  return NextResponse.json(newChunk)
}
