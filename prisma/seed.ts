import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const examDomains = [
  { romanNumeral: 'I', title: 'Foundations of AI Governance', weightMin: 16, weightMax: 20, description: 'Defines AI and machine learning, types of AI systems, socio-cultural context, core risks, trustworthy AI characteristics, responsible AI principles.' },
  { romanNumeral: 'II', title: 'Laws, Standards and Frameworks', weightMin: 20, weightMax: 20, description: 'AI-specific regulation, global laws, data privacy, intellectual property, liability frameworks.' },
  { romanNumeral: 'III', title: 'Govern AI Development', weightMin: 30, weightMax: 30, description: 'Planning, designing, building AI systems, governing data collection and use in AI development.' },
  { romanNumeral: 'IV', title: 'Govern AI Deployment', weightMin: 30, weightMax: 30, description: 'Preparation, execution, and post-implementation activities for AI deployment.' },
]

const trainingModules = [
  { number: 1, title: 'Foundations of Artificial Intelligence', description: 'Defines AI and machine learning, presents an overview of the different types of AI systems and their use cases, and positions AI models in the broader socio-cultural context.', sortOrder: 1, examDomainNum: 'I' },
  { number: 2, title: 'AI Impacts and Responsible Principles', description: 'Outlines the core risks and harms posed by AI systems, the characteristics of trustworthy AI systems, and the principles essential to responsible and ethical AI.', sortOrder: 2, examDomainNum: 'I' },
  { number: 3, title: 'AI Governance and Risk Management', description: 'Examines the details of building AI governance, including collaborating with major AI stakeholders, defining roles and responsibilities, and identifying and managing risks.', sortOrder: 3, examDomainNum: 'I,III' },
  { number: 4, title: 'AI Regulation', description: 'Describes relevant global laws and discusses key points related to terminology, risk levels, requirements, governance and enforcement as laid out in AI-specific regulation.', sortOrder: 4, examDomainNum: 'II' },
  { number: 5, title: 'Other Laws that Apply to AI', description: 'Surveys the existing laws that govern AI, provides awareness of liability reform, and outlines how various legal frameworks, including data privacy and intellectual property laws, intersect with AI applications.', sortOrder: 5, examDomainNum: 'II' },
  { number: 6, title: 'Governing AI Development', description: 'Explains considerations for planning, designing and building AI systems, including governing data collection and use in AI design and development.', sortOrder: 6, examDomainNum: 'III' },
  { number: 7, title: 'Governing AI Deployment', description: 'Addresses best practices for the preparation and execution of AI deployment, as well as post-implementation activities.', sortOrder: 7, examDomainNum: 'IV' },
]

async function main() {
  for (const d of examDomains) {
    await prisma.examDomain.upsert({
      where: { romanNumeral: d.romanNumeral },
      update: {},
      create: d,
    })
  }

  for (const m of trainingModules) {
    const domainNums = m.examDomainNum.split(',')
    const existing = await prisma.trainingModule.findUnique({ where: { number: m.number } })
    if (existing) continue

    const domainIds = await Promise.all(
      domainNums.map(async (num) => {
        const d = await prisma.examDomain.findUnique({ where: { romanNumeral: num.trim() } })
        return d!.id
      })
    )

    await prisma.trainingModule.create({
      data: {
        number: m.number,
        title: m.title,
        description: m.description,
        sortOrder: m.sortOrder,
        examDomains: { create: domainIds.map((id) => ({ examDomainId: id })) },
      },
    })
  }

  console.log('Seed complete: 4 exam domains, 7 training modules')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
