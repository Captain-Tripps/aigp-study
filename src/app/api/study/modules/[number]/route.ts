import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { number: string } }
) {
  const num = parseInt(params.number, 10)
  const record = await prisma.trainingModule.findUnique({
    where: { number: num },
    include: {
      competencies: {
        orderBy: { code: 'asc' },
        include: {
          performanceIndicators: {
            orderBy: { code: 'asc' },
            include: { contentChunks: true, userProgress: true },
          },
        },
      },
    },
  })

  if (!record) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const detail = {
    id: record.id,
    number: record.number,
    title: record.title,
    description: record.description,
    competencies: record.competencies.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      performanceIndicators: c.performanceIndicators.map((pi) => ({
        id: pi.id,
        code: pi.code,
        description: pi.description,
        competencyId: c.id,
          chunks: pi.contentChunks.map((ch) => ({
            id: ch.id,
            type: ch.type,
            title: ch.title,
            content: ch.editedContent || ch.content,
            sourcePage: ch.sourcePage,
            sourceType: ch.sourceType,
            sourceUrl: ch.sourceUrl,
            isEdited: ch.isEdited,
            editedContent: ch.editedContent,
          })),
        progress: pi.userProgress
          ? { status: pi.userProgress.status, confidence: pi.userProgress.confidence }
          : null,
      })),
    })),
  }

  return NextResponse.json(detail)
}
