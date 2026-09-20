import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { roman: string } }
) {
  const domain = await prisma.examDomain.findUnique({
    where: { romanNumeral: params.roman.toUpperCase() },
    include: {
      modules: { include: { trainingModule: true } },
      competencies: {
        orderBy: { code: 'asc' },
        include: {
          trainingModule: true,
          performanceIndicators: {
            orderBy: { code: 'asc' },
            include: { userProgress: true },
          },
        },
      },
    },
  })

  if (!domain) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }

  const allPis = domain.competencies.flatMap((c) => c.performanceIndicators)
  const donePis = allPis.filter((pi) => pi.userProgress?.status === 'done').length

  const detail = {
    id: domain.id,
    romanNumeral: domain.romanNumeral,
    title: domain.title,
    weightMin: domain.weightMin,
    weightMax: domain.weightMax,
    description: domain.description,
    modules: domain.modules.map((m) => ({
      number: m.trainingModule.number,
      title: m.trainingModule.title,
    })),
    competencies: domain.competencies.map((c) => ({
      code: c.code,
      title: c.title,
      moduleNumber: c.trainingModule.number,
      pis: c.performanceIndicators.map((pi) => ({
        code: pi.code,
        description: pi.description,
        status: pi.userProgress?.status || 'not_started',
        confidence: pi.userProgress?.confidence || 0,
      })),
    })),
    readiness: allPis.length > 0 ? Math.round((donePis / allPis.length) * 100) : 0,
  }

  return NextResponse.json(detail)
}
