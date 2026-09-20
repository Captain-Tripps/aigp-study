import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const data = await req.json()

  if (!data.examDomains || !data.trainingModules) {
    return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
  }

  await prisma.$transaction(async () => {
    for (const d of data.examDomains) {
      await prisma.examDomain.upsert({
        where: { romanNumeral: d.romanNumeral },
        update: d,
        create: d,
      })
    }

    for (const m of data.trainingModules) {
      await prisma.trainingModule.upsert({
        where: { number: m.number },
        update: m,
        create: m,
      })
    }

    for (const p of data.userProgress || []) {
      await prisma.userProgress.upsert({
        where: { performanceIndicatorId: p.performanceIndicatorId },
        update: p,
        create: p,
      })
    }
  })

  return NextResponse.json({ success: true })
}
