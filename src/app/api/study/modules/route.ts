import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const modules = await prisma.trainingModule.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      competencies: {
        include: {
          performanceIndicators: { include: { userProgress: true } },
        },
      },
    },
  })

  const summaries = modules.map((m) => {
    const pis = m.competencies.flatMap((c) => c.performanceIndicators)
    const completed = pis.filter((pi) => pi.userProgress?.status === 'done').length
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      completion: pis.length > 0 ? Math.round((completed / pis.length) * 100) : 0,
      totalPis: pis.length,
    }
  })

  return NextResponse.json(summaries)
}
