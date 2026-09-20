import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const flashcards = [
  { front: 'What is AI?', back: 'Artificial Intelligence is the simulation of human intelligence by machines, enabling them to perform tasks such as learning, reasoning, and problem-solving.', pi: 'I.A.1' },
  { front: 'What is Machine Learning?', back: 'A subset of AI that enables systems to automatically learn and improve from experience without being explicitly programmed.', pi: 'I.A.2' },
  { front: 'What is the EU AI Act?', back: 'The world first comprehensive AI regulation, classifying AI systems by risk level and imposing obligations accordingly.', pi: 'II.A.1' },
  { front: 'What is the NIST AI RMF?', back: 'The NIST AI Risk Management Framework, providing a voluntary framework for managing AI risks across the AI lifecycle.', pi: 'I.C.1' },
  { front: 'What is algorithmic bias?', back: 'Systematic and repeatable errors in a computer system that create unfair outcomes, often disadvantaging certain demographic groups.', pi: 'I.A.3' },
  { front: 'What is a model card?', back: 'A documentation artifact describing an AI model capabilities, limitations, intended use, performance characteristics, and ethical considerations.', pi: 'III.A.1' },
  { front: 'What is human oversight in AI governance?', back: 'The ability of humans to effectively oversee, intervene in, or override AI system operations, ensuring accountability and safety.', pi: 'II.B.1' },
  { front: 'What is data governance in the AI context?', back: 'The management of data quality, availability, usability, and security throughout the AI lifecycle, ensuring data is fit for purpose and compliant with regulations.', pi: 'III.B.1' },
]

async function main() {
  for (const fc of flashcards) {
    const pi = await prisma.performanceIndicator.findUnique({ where: { code: fc.pi } })
    if (!pi) continue

    await prisma.flashcard.create({
      data: {
        front: fc.front,
        back: fc.back,
        performanceIndicatorId: pi.id,
      },
    })
  }

  const count = await prisma.flashcard.count()
  console.log(`Seeded ${count} flashcards`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
