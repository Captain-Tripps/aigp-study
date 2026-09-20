import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  {
    text: 'Which of the following best defines a "high-risk AI system" under the EU AI Act?',
    options: [
      'Any AI system that uses machine learning',
      'An AI system that poses a significant risk to health, safety, or fundamental rights',
      'Any AI system deployed in the EU',
      'An AI system with more than 1 million parameters',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act classifies AI systems as high-risk when they pose significant risks to health, safety, or fundamental rights.',
    source: 'manual',
    domain: 'II',
    module: 4,
    pi: null,
    difficulty: 'medium',
  },
  {
    text: 'What is the primary purpose of the NIST AI Risk Management Framework?',
    options: [
      'To regulate all AI development in the United States',
      'To provide a voluntary framework for managing AI risks across the AI lifecycle',
      'To certify AI systems for market entry',
      'To replace existing risk management standards',
    ],
    correctAnswer: 1,
    explanation: 'The NIST AI RMF is a voluntary framework for managing AI risks. It is not a regulation or certification scheme.',
    source: 'manual',
    domain: 'I',
    module: 1,
    pi: null,
    difficulty: 'easy',
  },
  {
    text: 'Which principle is NOT part of the EU AI Act requirements for high-risk AI systems?',
    options: [
      'Human oversight',
      'Data governance and quality',
      'Maximum profit optimization',
      'Transparency and explainability',
    ],
    correctAnswer: 2,
    explanation: 'The EU AI Act requires human oversight, data governance, transparency, accuracy, robustness, and cybersecurity. Maximum profit optimization is not a requirement.',
    source: 'manual',
    domain: 'II',
    module: 4,
    pi: null,
    difficulty: 'medium',
  },
  {
    text: 'In AI governance, what does "model card" refer to?',
    options: [
      'A credit card for accessing AI models',
      'A documentation artifact describing a model capabilities, limitations, and intended use',
      'A regulatory filing required by the FTC',
      'A type of neural network architecture',
    ],
    correctAnswer: 1,
    explanation: 'Model cards are documentation artifacts describing an AI model intended use, performance, limitations, and ethical considerations.',
    source: 'manual',
    domain: 'III',
    module: 6,
    pi: null,
    difficulty: 'medium',
  },
  {
    text: 'What is "algorithmic bias" in the context of AI systems?',
    options: [
      'A programming error that causes the algorithm to crash',
      'Systematic and unfair patterns in AI model outputs that disadvantage certain groups',
      'The natural tendency of algorithms to prefer certain data types',
      'A legal term for non-compliance with data protection laws',
    ],
    correctAnswer: 1,
    explanation: 'Algorithmic bias refers to systematic and repeatable errors in a computer system that create unfair outcomes, often disadvantaging certain demographic groups.',
    source: 'manual',
    domain: 'I',
    module: 2,
    pi: null,
    difficulty: 'easy',
  },
  {
    text: 'Which of the following is a key responsibility of an AI governance committee?',
    options: [
      'Writing all the code for AI systems',
      'Establishing policies, monitoring compliance, and managing AI-related risks',
      'Purchasing all AI software licenses',
      'Conducting all AI system testing',
    ],
    correctAnswer: 1,
    explanation: 'An AI governance committee establishes AI policies, monitors compliance, manages AI-related risks, and ensures accountability.',
    source: 'manual',
    domain: 'I',
    module: 3,
    pi: null,
    difficulty: 'easy',
  },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { text: q.text } })
    if (existing) {
      skipped++
      continue
    }

    const domain = await prisma.examDomain.findUnique({ where: { romanNumeral: q.domain } })
    if (!domain) continue

    let moduleId: number | null = null
    if (q.module) {
      const mod = await prisma.trainingModule.findUnique({ where: { number: q.module } })
      moduleId = mod?.id ?? null
    }

    await prisma.question.create({
      data: {
        text: q.text,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        source: q.source,
        examDomainId: domain.id,
        trainingModuleId: moduleId,
        difficulty: q.difficulty,
      },
    })
    created++
  }

  const count = await prisma.question.count()
  console.log(`Seeded ${created} questions (skipped ${skipped} existing, ${count} total)`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
