import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type PerformanceIndicatorIn = {
  id: number
  code: string
  description: string
  competencyId: number
}

type CompetencyIn = {
  id: number
  code: string
  title: string
  description: string
  trainingModuleId: number
  examDomainId: number
  performanceIndicators?: PerformanceIndicatorIn[]
}

type ExamDomainToModuleIn = {
  id?: number
  examDomainId: number
  trainingModuleId: number
}

type TrainingModuleIn = {
  id: number
  number: number
  title: string
  description: string
  sortOrder?: number
  competencies?: CompetencyIn[]
}

type ExamDomainIn = {
  id: number
  romanNumeral: string
  title: string
  weightMin: number
  weightMax: number
  description: string
  modules?: ExamDomainToModuleIn[]
  competencies?: CompetencyIn[]
}

type ContentChunkIn = {
  id: number
  performanceIndicatorId: number
  type: string
  title: string
  content: string
  sourcePage?: number | null
  sourceUrl?: string | null
  sourceType?: string
  isEdited?: boolean
  editedContent?: string | null
  editedAt?: string | null
  metadata?: string | null
}

type UserProgressIn = {
  id: number
  performanceIndicatorId: number
  status?: string
  confidence?: number
  lastReviewed?: string | null
  reviewCount?: number
  easeFactor?: number
  interval?: number
  nextReviewDate?: string | null
}

type QuestionIn = {
  id: number
  text: string
  options: string
  correctAnswer: number
  explanation: string
  source: string
  performanceIndicatorId?: number | null
  examDomainId: number
  trainingModuleId?: number | null
  difficulty?: string
}

type QuestionAttemptIn = {
  id: number
  questionId: number
  selectedAnswer: number
  wasCorrect: boolean
  answeredAt?: string
}

type FlashcardIn = {
  id: number
  front: string
  back: string
  performanceIndicatorId: number
  easeFactor?: number
  interval?: number
  nextReviewDate?: string | null
  reviewCount?: number
}

type StudyPlanIn = {
  id: number
  examDate: string
  weeklyHours: number
  startDate: string
  moduleSchedule: string
  domainTargets: string
  createdAt?: string
  updatedAt?: string
}

type ImportData = {
  examDomains?: ExamDomainIn[]
  trainingModules?: TrainingModuleIn[]
  userProgress?: UserProgressIn[]
  questions?: QuestionIn[]
  questionAttempts?: QuestionAttemptIn[]
  flashcards?: FlashcardIn[]
  contentChunks?: ContentChunkIn[]
  studyPlan?: StudyPlanIn | null
}

function withoutId<T extends { id: unknown }>(record: T): Omit<T, 'id'> {
  const copy = { ...record }
  delete (copy as Record<string, unknown>).id
  return copy as Omit<T, 'id'>
}

function withoutNested<T>(record: T): Omit<T, 'modules' | 'competencies'> {
  const copy = { ...record }
  delete (copy as Record<string, unknown>).modules
  delete (copy as Record<string, unknown>).competencies
  return copy as Omit<T, 'modules' | 'competencies'>
}

export async function POST(req: Request) {
  const data = (await req.json()) as ImportData

  const examDomainsIn = data.examDomains ?? []
  const trainingModulesIn = data.trainingModules ?? []
  const userProgressIn = data.userProgress ?? []
  const questionsIn = data.questions ?? []
  const attemptsIn = data.questionAttempts ?? []
  const flashcardsIn = data.flashcards ?? []
  const chunksIn = data.contentChunks ?? []
  const studyPlanIn = data.studyPlan ?? null

  const examDomainMap = new Map<number, number>()
  const moduleMap = new Map<number, number>()
  const competencyMap = new Map<number, number>()
  const indicatorMap = new Map<number, number>()
  const questionMap = new Map<number, number>()

  const counts = {
    examDomains: 0,
    trainingModules: 0,
    examDomainToModule: 0,
    competencies: 0,
    performanceIndicators: 0,
    contentChunks: 0,
    userProgress: 0,
    questions: 0,
    questionAttempts: 0,
    flashcards: 0,
    studyPlan: 0,
  }

  await prisma.$transaction(async () => {
    // 1. Exam domains (by romanNumeral). Nested modules/competencies are handled later.
    for (const d of examDomainsIn) {
      const fields = withoutNested(d)
      const created = await prisma.examDomain.upsert({
        where: { romanNumeral: d.romanNumeral },
        update: fields,
        create: fields,
      })
      examDomainMap.set(d.id, created.id)
      counts.examDomains++
    }

    // 2. Training modules (by number). Nested competencies are handled later.
    for (const m of trainingModulesIn) {
      const fields = withoutNested(m)
      const created = await prisma.trainingModule.upsert({
        where: { number: m.number },
        update: fields,
        create: fields,
      })
      moduleMap.set(m.id, created.id)
      counts.trainingModules++
    }

    // 3. ExamDomainToModule junction (from nested examDomain.modules).
    for (const d of examDomainsIn) {
      const newDomainId = examDomainMap.get(d.id)
      if (newDomainId === undefined) continue
      for (const link of d.modules ?? []) {
        const newModuleId = moduleMap.get(link.trainingModuleId)
        if (newModuleId === undefined) continue
        await prisma.examDomainToModule.upsert({
          where: { examDomainId_trainingModuleId: { examDomainId: newDomainId, trainingModuleId: newModuleId } },
          update: {},
          create: { examDomainId: newDomainId, trainingModuleId: newModuleId },
        })
        counts.examDomainToModule++
      }
    }

    // 4. Competencies (by code), merged from both nested sources and deduped by id.
    type CompetencyRecord = {
      code: string
      title: string
      description: string
      trainingModuleId: number
      examDomainId: number
    }
    const competencyRecords = new Map<number, CompetencyRecord>()
    for (const m of trainingModulesIn) {
      const newModuleId = moduleMap.get(m.id)
      if (newModuleId === undefined) continue
      for (const c of m.competencies ?? []) {
        const newDomainId = examDomainMap.get(c.examDomainId)
        if (newDomainId === undefined) continue
        competencyRecords.set(c.id, {
          code: c.code,
          title: c.title,
          description: c.description,
          trainingModuleId: newModuleId,
          examDomainId: newDomainId,
        })
      }
    }
    for (const d of examDomainsIn) {
      const newDomainId = examDomainMap.get(d.id)
      if (newDomainId === undefined) continue
      for (const c of d.competencies ?? []) {
        const existing = competencyRecords.get(c.id)
        if (existing) {
          existing.examDomainId = newDomainId
        } else {
          const newModuleId = moduleMap.get(c.trainingModuleId)
          if (newModuleId === undefined) continue
          competencyRecords.set(c.id, {
            code: c.code,
            title: c.title,
            description: c.description,
            trainingModuleId: newModuleId,
            examDomainId: newDomainId,
          })
        }
      }
    }
    const recordEntries = Array.from(competencyRecords.entries())
    for (let i = 0; i < recordEntries.length; i++) {
      const entry = recordEntries[i]
      const oldId = entry[0]
      const c = entry[1]
      const created = await prisma.competency.upsert({
        where: { code: c.code },
        update: { title: c.title, description: c.description, trainingModuleId: c.trainingModuleId, examDomainId: c.examDomainId },
        create: { code: c.code, title: c.title, description: c.description, trainingModuleId: c.trainingModuleId, examDomainId: c.examDomainId },
      })
      competencyMap.set(oldId, created.id)
      counts.competencies++
    }

    // 5. Performance indicators (by code), nested under competencies.
    for (const m of trainingModulesIn) {
      for (const c of m.competencies ?? []) {
        const newCompetencyId = competencyMap.get(c.id)
        if (newCompetencyId === undefined) continue
        for (const p of c.performanceIndicators ?? []) {
          const created = await prisma.performanceIndicator.upsert({
            where: { code: p.code },
            update: { description: p.description, competencyId: newCompetencyId },
            create: { code: p.code, description: p.description, competencyId: newCompetencyId },
          })
          indicatorMap.set(p.id, created.id)
          counts.performanceIndicators++
        }
      }
    }

    // 6. Content chunks.
    for (const c of chunksIn) {
      const newPiId = indicatorMap.get(c.performanceIndicatorId)
      if (newPiId === undefined) continue
      const fields = { ...withoutId(c), performanceIndicatorId: newPiId }
      await prisma.contentChunk.upsert({
        where: { id: c.id },
        update: fields,
        create: fields,
      })
      counts.contentChunks++
    }

    // 7. User progress (by performanceIndicatorId).
    for (const p of userProgressIn) {
      const newPiId = indicatorMap.get(p.performanceIndicatorId)
      if (newPiId === undefined) continue
      const fields = withoutId(p)
      await prisma.userProgress.upsert({
        where: { performanceIndicatorId: newPiId },
        update: fields,
        create: { ...fields, performanceIndicatorId: newPiId },
      })
      counts.userProgress++
    }

    // 8. Questions (by ID), with foreign keys remapped to the local IDs.
    for (const q of questionsIn) {
      const fields = withoutId(q)
      const newPiId = q.performanceIndicatorId != null ? indicatorMap.get(q.performanceIndicatorId) : undefined
      fields.performanceIndicatorId = newPiId ?? null
      const newDomainId = examDomainMap.get(q.examDomainId) ?? q.examDomainId
      fields.examDomainId = newDomainId
      const newModuleId = q.trainingModuleId != null ? moduleMap.get(q.trainingModuleId) : undefined
      fields.trainingModuleId = newModuleId ?? null
      const created = await prisma.question.upsert({
        where: { id: q.id },
        update: fields,
        create: fields,
      })
      questionMap.set(q.id, created.id)
      counts.questions++
    }

    // 9. Question attempts.
    for (const a of attemptsIn) {
      const newQuestionId = questionMap.get(a.questionId)
      if (newQuestionId === undefined) continue
      const fields = { ...withoutId(a), questionId: newQuestionId }
      await prisma.questionAttempt.upsert({
        where: { id: a.id },
        update: fields,
        create: fields,
      })
      counts.questionAttempts++
    }

    // 10. Flashcards.
    for (const f of flashcardsIn) {
      const newPiId = indicatorMap.get(f.performanceIndicatorId)
      if (newPiId === undefined) continue
      const fields = { ...withoutId(f), performanceIndicatorId: newPiId }
      await prisma.flashcard.upsert({
        where: { id: f.id },
        update: fields,
        create: fields,
      })
      counts.flashcards++
    }

    // 11. Study plan (single record; upserted against the first existing row).
    if (studyPlanIn) {
      const fields = withoutId(studyPlanIn)
      const existing = await prisma.studyPlan.findFirst({ orderBy: { id: 'asc' } })
      if (existing) {
        await prisma.studyPlan.update({ where: { id: existing.id }, data: fields })
      } else {
        await prisma.studyPlan.create({ data: fields })
      }
      counts.studyPlan++
    }
  })

  return NextResponse.json({ success: true, counts })
}
