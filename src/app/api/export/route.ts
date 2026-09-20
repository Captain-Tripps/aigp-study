import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = {
    examDomains: await prisma.examDomain.findMany({
      include: { modules: true, competencies: true },
    }),
    trainingModules: await prisma.trainingModule.findMany({
      include: { competencies: { include: { performanceIndicators: true } } },
    }),
    userProgress: await prisma.userProgress.findMany(),
    questions: await prisma.question.findMany(),
    questionAttempts: await prisma.questionAttempt.findMany(),
    flashcards: await prisma.flashcard.findMany(),
    contentChunks: await prisma.contentChunk.findMany(),
    studyPlan: await prisma.studyPlan.findFirst({ orderBy: { createdAt: 'desc' } }),
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': 'attachment; filename="aigp-study-export.json"',
    },
  })
}
