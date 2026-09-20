import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { chunkId: string } }
) {
  const id = parseInt(params.chunkId, 10)
  const revisions = await prisma.contentChunkRevision.findMany({
    where: { contentChunkId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(revisions)
}

export async function POST(
  req: Request,
  { params }: { params: { chunkId: string } }
) {
  const id = parseInt(params.chunkId, 10)
  const { editedContent, metadata, previousContent } = await req.json()

  if (!editedContent || !previousContent) {
    return NextResponse.json(
      { error: 'editedContent and previousContent required' },
      { status: 400 }
    )
  }

  const chunk = await prisma.contentChunk.findUnique({ where: { id } })
  if (!chunk) {
    return NextResponse.json({ error: 'Chunk not found' }, { status: 404 })
  }

  const metadataStr =
    typeof metadata === 'string'
      ? metadata
      : metadata
        ? JSON.stringify(metadata)
        : null

  const revision = await prisma.contentChunkRevision.create({
    data: {
      contentChunkId: id,
      editedContent,
      metadata: metadataStr,
      previousContent,
    },
  })

  return NextResponse.json(revision)
}
