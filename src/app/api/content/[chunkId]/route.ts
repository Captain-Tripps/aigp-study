import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { chunkId: string } }
) {
  const id = parseInt(params.chunkId, 10)
  const chunk = await prisma.contentChunk.findUnique({
    where: { id },
    include: {
      performanceIndicator: { select: { code: true, description: true } },
    },
  })

  if (!chunk) {
    return NextResponse.json({ error: 'Chunk not found' }, { status: 404 })
  }

  return NextResponse.json(chunk)
}

export async function PUT(
  req: Request,
  { params }: { params: { chunkId: string } }
) {
  const id = parseInt(params.chunkId, 10)
  const { editedContent, metadata } = await req.json()

  if (!editedContent) {
    return NextResponse.json({ error: 'editedContent required' }, { status: 400 })
  }

  const chunk = await prisma.contentChunk.findUnique({ where: { id } })
  if (!chunk) {
    return NextResponse.json({ error: 'Chunk not found' }, { status: 404 })
  }

  const previousContent = chunk.editedContent || chunk.content
  const metadataStr =
    typeof metadata === 'string'
      ? metadata
      : metadata
        ? JSON.stringify(metadata)
        : null

  await prisma.contentChunkRevision.create({
    data: {
      contentChunkId: id,
      editedContent,
      metadata: metadataStr,
      previousContent,
    },
  })

  await prisma.contentChunk.update({
    where: { id },
    data: {
      editedContent,
      isEdited: true,
      editedAt: new Date(),
      ...(metadataStr && { metadata: metadataStr }),
    },
  })

  return NextResponse.json({ success: true, id })
}
