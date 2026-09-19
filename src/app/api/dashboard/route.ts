import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { DomainReadiness, ModuleProgress } from '@/types/dashboard'

export async function GET() {
  const domains = await prisma.examDomain.findMany({
    include: {
      competencies: {
        include: {
          performanceIndicators: { include: { userProgress: true } },
        },
      },
    },
  })

  const domainReadiness: DomainReadiness[] = domains.map((d) => {
    const pis = d.competencies.flatMap((c) => c.performanceIndicators)
    const totalPis = pis.length
    const completedPis = pis.filter((pi) => pi.userProgress?.status === 'done').length
    const avgConfidence = totalPis > 0
      ? pis.reduce((sum, pi) => sum + (pi.userProgress?.confidence || 0), 0) / totalPis
      : 0
    return {
      id: d.id,
      romanNumeral: d.romanNumeral,
      title: d.title,
      weightMin: d.weightMin,
      weightMax: d.weightMax,
      readiness: totalPis > 0 ? Math.round((completedPis / totalPis) * 100) : 0,
      completedPis,
      totalPis,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
    }
  })

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

  const moduleProgress: ModuleProgress[] = modules.map((m) => {
    const pis = m.competencies.flatMap((c) => c.performanceIndicators)
    const totalPis = pis.length
    const completedPis = pis.filter((pi) => pi.userProgress?.status === 'done').length
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      completion: totalPis > 0 ? Math.round((completedPis / totalPis) * 100) : 0,
      completedPis,
      totalPis,
      avgConfidence: totalPis > 0
        ? Math.round((pis.reduce((sum, pi) => sum + (pi.userProgress?.confidence || 0), 0) / totalPis) * 10) / 10
        : 0,
    }
  })

  const nextActions: string[] = []
  const incomplete = moduleProgress.filter((m) => m.completion < 100)
  if (incomplete.length > 0) {
    nextActions.push(`Continue Module ${incomplete[0].number}: ${incomplete[0].title}`)
  }

  return NextResponse.json({
    domains: domainReadiness,
    modules: moduleProgress,
    nextActions,
  })
}
