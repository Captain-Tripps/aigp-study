import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')
  const moduleParam = searchParams.get('module')
  const difficulty = searchParams.get('difficulty')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10) || 50)
  )

  const where: Record<string, unknown> = {}
  if (domain) {
    const d = await prisma.examDomain.findUnique({ where: { romanNumeral: domain.toUpperCase() } })
    if (d) where.examDomainId = d.id
  }
  if (moduleParam) {
    const m = await prisma.trainingModule.findUnique({ where: { number: parseInt(moduleParam, 10) } })
    if (m) where.trainingModuleId = m.id
  }
  if (difficulty) where.difficulty = difficulty

  const questions = await prisma.question.findMany({
    where,
    include: {
      examDomain: { select: { romanNumeral: true, title: true } },
      trainingModule: { select: { number: true, title: true } },
      performanceIndicator: { select: { code: true, description: true } },
    },
    orderBy: { id: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const total = await prisma.question.count({ where })

  return NextResponse.json({
    questions: questions.map((q) => ({ ...q, options: JSON.parse(q.options) })),
    total,
    page,
    pageSize,
  })
}
