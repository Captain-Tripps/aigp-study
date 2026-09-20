import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { questionId, selectedAnswer } = await req.json()

  if (!questionId || selectedAnswer === undefined) {
    return NextResponse.json({ error: 'questionId and selectedAnswer required' }, { status: 400 })
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } })
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const wasCorrect = selectedAnswer === question.correctAnswer

  await prisma.questionAttempt.create({
    data: { questionId, selectedAnswer, wasCorrect },
  })

  return NextResponse.json({
    wasCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  })
}
