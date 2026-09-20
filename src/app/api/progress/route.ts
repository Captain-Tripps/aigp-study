import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateConfidence } from '@/lib/progress-utils'

export async function PUT(req: Request) {
  const body = await req.json()
  const { piId, status, confidence } = body

  if (!piId || !status) {
    return NextResponse.json({ error: 'piId and status required' }, { status: 400 })
  }

  const validStatuses = ['not_started', 'in_progress', 'done']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const conf = validateConfidence(confidence || 0)

  await prisma.userProgress.upsert({
    where: { performanceIndicatorId: piId },
    update: { status, confidence: conf, lastReviewed: new Date() },
    create: {
      performanceIndicatorId: piId,
      status,
      confidence: conf,
      lastReviewed: new Date(),
    },
  })

  return NextResponse.json({ success: true, piId, status, confidence: conf })
}
