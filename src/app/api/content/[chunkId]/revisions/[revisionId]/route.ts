import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { chunkId: string; revisionId: string } }
) {
  const chunkId = parseInt(params.chunkId, 10)
  const revisionId = parseInt(params.revisionId, 10)

  const revision = await prisma.contentChunkRevision.findFirst({
    where: { id: revisionId, contentChunkId: chunkId },
  })
  if (!revision) {
    return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
  }

  return NextResponse.json(revision)
}

export async function PUT(
  _req: Request,
  { params }: { params: { chunkId: string; revisionId: string } }
) {
  const chunkId = parseInt(params.chunkId, 10)
  const revisionId = parseInt(params.revisionId, 10)

  const revision = await prisma.contentChunkRevision.findFirst({
    where: { id: revisionId, contentChunkId: chunkId },
  })
  if (!revision) {
    return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
  }

  await prisma.contentChunk.update({
    where: { id: chunkId },
    data: {
      editedContent: revision.editedContent,
      metadata: revision.metadata,
      isEdited: true,
      editedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}
