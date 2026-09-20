import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { chunkId: string } }
) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20)
  )
  const id = parseInt(params.chunkId, 10)
  const where = { contentChunkId: id }
  const revisions = await prisma.contentChunkRevision.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  const total = await prisma.contentChunkRevision.count({ where })
  return NextResponse.json({ revisions, total, page, pageSize })
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
