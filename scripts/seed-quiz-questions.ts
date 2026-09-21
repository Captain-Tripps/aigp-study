/**
 * Seed the 10 AIGP Playbook practice questions into the Question table.
 *
 * Maps each quiz question to a BOK PI and ExamDomain based on topic overlap.
 * The Playbook uses its own 12-domain structure (D1-D12); we map to our
 * 4 BOK domains (I-IV) + 7 modules.
 *
 * Usage: npx tsx scripts/seed-quiz-questions.ts
 */
import { PrismaClient } from '@prisma/client'
import quizQuestions from './quiz-questions.json'

const prisma = new PrismaClient()

// Map Playbook quiz domains to our BOK structure
// Each question maps to: { piCode, examDomainRoman, moduleNumber }
const QUESTION_MAP: Record<number, { piCode: string; domain: string; module: number }> = {
  // Q1: Generative AI — expert systems vs LLMs for regulated decisions
  1: { piCode: 'III.C.5', domain: 'III', module: 6 },
  // Q2: AI Fairness — historical bias in training data
  2: { piCode: 'II.B.1', domain: 'II', module: 5 },
  // Q3: GDPR — automated decision-making transparency
  3: { piCode: 'I.C.1', domain: 'I', module: 3 },
  // Q4: Vendor Risk — legal review before vendor selection
  4: { piCode: 'II.D.1', domain: 'II', module: 5 },
  // Q5: OECD — conformity testing and certification
  5: { piCode: 'I.B.2', domain: 'I', module: 2 },
  // Q6: Vendor Risk — AUP review before contract
  6: { piCode: 'II.D.1', domain: 'II', module: 5 },
  // Q7: AI Lifecycle — model documentation
  7: { piCode: 'III.A.3', domain: 'III', module: 6 },
  // Q8: AI Lifecycle — use case selection criteria
  8: { piCode: 'III.A.1', domain: 'III', module: 6 },
  // Q9: NIST AI RMF — security vs AI risk scope
  9: { piCode: 'I.B.1', domain: 'I', module: 2 },
  // Q10: AI Fairness — underrepresentation in training data
  10: { piCode: 'II.B.2', domain: 'II', module: 5 },
}

async function main() {
  console.log(`Seeding ${quizQuestions.length} quiz questions...`)

  // Check if questions already exist (idempotent)
  const existing = await prisma.question.count()
  if (existing > 0) {
    console.log(`  ${existing} questions already exist. Skipping (idempotent).`)
    console.log(`  To re-seed: delete existing questions first.`)
    await prisma.$disconnect()
    return
  }

  let seeded = 0

  for (const q of quizQuestions) {
    const mapping = QUESTION_MAP[q.number]
    if (!mapping) {
      console.log(`  SKIP Q${q.number}: no mapping`)
      continue
    }

    // Look up the PI
    const pi = await prisma.performanceIndicator.findUnique({
      where: { code: mapping.piCode },
    })
    if (!pi) {
      console.log(`  SKIP Q${q.number}: PI ${mapping.piCode} not found`)
      continue
    }

    // Look up the exam domain
    const domain = await prisma.examDomain.findUnique({
      where: { romanNumeral: mapping.domain },
    })
    if (!domain) {
      console.log(`  SKIP Q${q.number}: domain ${mapping.domain} not found`)
      continue
    }

    // Look up the module (via competency)
    const module = await prisma.trainingModule.findUnique({
      where: { number: mapping.module },
    })
    if (!module) {
      console.log(`  SKIP Q${q.number}: module ${mapping.module} not found`)
      continue
    }

    await prisma.question.create({
      data: {
        text: q.stem,
        options: JSON.stringify([q.options.A, q.options.B, q.options.C, q.options.D]),
        correctAnswer: q.answer.charCodeAt(0) - 65, // 'A'→0, 'B'→1, 'C'→2, 'D'→3
        explanation: q.rationale,
        source: 'AIGP Playbook (aigpplaybook.com)',
        performanceIndicatorId: pi.id,
        examDomainId: domain.id,
        trainingModuleId: module.id,
        difficulty: 'medium',
      },
    })

    seeded++
    console.log(`  Q${q.number} → PI ${mapping.piCode}, Domain ${mapping.domain}, Module ${mapping.module} ✓`)
  }

  console.log(`\nDone. ${seeded}/${quizQuestions.length} questions seeded.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
