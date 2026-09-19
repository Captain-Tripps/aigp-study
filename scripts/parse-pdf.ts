import { parsePdf } from '../lib/pdf-parser'
import { prisma } from '../lib/prisma'

const DEFAULT_PDF =
  'C:\\Users\\jstap\\OneDrive\\Documents\\New folder\\aigp-ai-governance-professional-study-supplement.pdf'

async function main() {
  const pdfPath = process.argv[2] || DEFAULT_PDF
  console.log(`Parsing: ${pdfPath}`)

  const modules = await parsePdf(pdfPath)
  let competenciesCreated = 0
  let pisCreated = 0
  let chunksCreated = 0
  const errors: string[] = []

  const domains = await prisma.examDomain.findMany()
  const domainByRoman = new Map(domains.map((d) => [d.romanNumeral, d]))
  const domainById = new Map(domains.map((d) => [d.id, d]))

  for (const mod of modules) {
    const trainingModule = await prisma.trainingModule.findUnique({
      where: { number: mod.moduleNumber },
      include: { examDomains: true },
    })
    if (!trainingModule) {
      errors.push(`Module ${mod.moduleNumber} not found in DB (domain ${mod.title})`)
      continue
    }

    for (const comp of mod.competencies) {
      let examDomainId =
        trainingModule.examDomains[0]?.examDomainId ??
        domainByRoman.get(comp.code[0])?.id ??
        1

      const competency = await prisma.competency.upsert({
        where: { code: comp.code },
        update: { title: comp.title, description: comp.description, examDomainId },
        create: {
          code: comp.code,
          title: comp.title,
          description: comp.description,
          trainingModuleId: trainingModule.id,
          examDomainId,
        },
      })
      competenciesCreated++

      for (const pi of comp.performanceIndicators) {
        const indicator = await prisma.performanceIndicator.upsert({
          where: { code: pi.code },
          update: { description: pi.description, competencyId: competency.id },
          create: {
            code: pi.code,
            description: pi.description,
            competencyId: competency.id,
          },
        })
        pisCreated++

        for (const chunk of pi.contentChunks) {
          const existing = await prisma.contentChunk.findFirst({
            where: {
              performanceIndicatorId: indicator.id,
              title: chunk.title,
              sourcePage: chunk.sourcePage,
            },
          })
          if (!existing) {
            await prisma.contentChunk.create({
              data: {
                performanceIndicatorId: indicator.id,
                type: chunk.type,
                title: chunk.title,
                content: chunk.content,
                sourcePage: chunk.sourcePage,
                sourceType: 'pdf',
              },
            })
            chunksCreated++
          }
        }
      }
    }
  }

  const counts = await prisma.$transaction([
    prisma.examDomain.count(),
    prisma.competency.count(),
    prisma.performanceIndicator.count(),
    prisma.contentChunk.count(),
  ])
  const [domainCount, compCount, piCount, chunkCount] = counts

  console.log(
    JSON.stringify(
      {
        modulesProcessed: modules.length,
        competenciesCreated,
        pisCreated,
        chunksCreated,
        dbTotals: {
          examDomains: domainCount,
          competencies: compCount,
          performanceIndicators: piCount,
          contentChunks: chunkCount,
        },
        errors,
      },
      null,
      2
    )
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
