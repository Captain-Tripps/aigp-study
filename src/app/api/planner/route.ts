import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePlan } from '@/lib/planner'

export async function GET() {
  const plan = await prisma.studyPlan.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!plan) return NextResponse.json(null)

  return NextResponse.json({
    examDate: plan.examDate,
    weeklyHours: plan.weeklyHours,
    startDate: plan.startDate,
    moduleSchedule: JSON.parse(plan.moduleSchedule),
    domainTargets: JSON.parse(plan.domainTargets),
  })
}

export async function POST(req: Request) {
  const { examDate, weeklyHours } = await req.json()

  if (!examDate || !weeklyHours) {
    return NextResponse.json({ error: 'examDate and weeklyHours required' }, { status: 400 })
  }

  const plan = generatePlan(new Date(examDate), weeklyHours)

  await prisma.studyPlan.create({
    data: {
      examDate: plan.examDate,
      weeklyHours: plan.weeklyHours,
      startDate: plan.startDate,
      moduleSchedule: JSON.stringify(plan.weeks),
      domainTargets: JSON.stringify(
        plan.weeks[plan.weeks.length - 1].domainMilestones
      ),
    },
  })

  return NextResponse.json({
    examDate: plan.examDate,
    weeklyHours: plan.weeklyHours,
    startDate: plan.startDate,
    totalWeeks: plan.totalWeeks,
    weeks: plan.weeks,
  })
}
