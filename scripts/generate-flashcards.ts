/**
 * Generate flashcards from term definitions in content chunks.
 *
 * Extracts **Term:** patterns from manual content chunks and creates
 * Flashcard records. Each chunk typically has 4-6 key terms, giving
 * ~250-350 flashcards across 58 PIs.
 *
 * Idempotent: skips if flashcards already exist for a PI.
 * Use --wipe to delete all existing flashcards before regenerating.
 *
 * Usage: npx tsx scripts/generate-flashcards.ts [--wipe]
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const WIPE = process.argv.includes('--wipe')

interface TermDefinition {
  term: string
  definition: string
}

/**
 * Extract **Term:** definition pairs from content.
 * Pattern: **Term Name:** followed by definition text on the same
 * line or the next non-empty line.
 */
function extractTerms(content: string): TermDefinition[] {
  const terms: TermDefinition[] = []
  // Match **Bold Term:** followed by rest-of-line content
  const regex = /\*\*([^*\n]+):?\*\*[:\s]*(.*)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    // Strip trailing colon from the term (e.g. "Narrow AI:" → "Narrow AI")
    const rawTerm = match[1].trim().replace(/:$/, '')
    let definition = match[2].trim()

    // The definition may be on the next line if the current line was just the term
    if (!definition) {
      const afterIdx = match.index + match[0].length
      const nextLines = content.substring(afterIdx).split('\n')
      // Find the next non-empty line
      for (const line of nextLines) {
        const trimmed = line.trim()
        if (trimmed) {
          definition = trimmed
          break
        }
      }
    }

    // Skip if no definition found, or if the LLM emitted "undefined"
    if (!definition || definition === 'undefined') continue

    // Clean up: remove trailing punctuation artifacts
    definition = definition.replace(/[\s]+$/, '')

    terms.push({ term: rawTerm, definition })
  }

  return terms
}

async function main() {
  if (WIPE) {
    const deleted = await prisma.flashcard.deleteMany()
    console.log(`Wiped ${deleted.count} existing flashcards.`)
  }

  const chunks = await prisma.contentChunk.findMany({
    where: { sourceType: 'manual' },
    orderBy: { id: 'asc' },
    select: { id: true, title: true, content: true, performanceIndicatorId: true },
  })

  let totalCreated = 0
  let totalSkipped = 0
  let chunksWithTerms = 0

  // Single count query for all PIs that already have flashcards (idempotent)
  const existingByPI = await prisma.flashcard.groupBy({
    by: ['performanceIndicatorId'],
    _count: { _all: true },
  })
  const existingCountByPI = new Map<number, number>()
  for (const row of existingByPI) {
    existingCountByPI.set(row.performanceIndicatorId, row._count._all)
  }

  // Collect all new flashcards, then batch-insert with createMany
  const toCreate: { front: string; back: string; performanceIndicatorId: number }[] = []

  for (const chunk of chunks) {
    if (!chunk.content) continue

    const existing = existingCountByPI.get(chunk.performanceIndicatorId) ?? 0
    if (existing > 0) {
      totalSkipped += existing
      continue
    }

    const terms = extractTerms(chunk.content)
    if (terms.length === 0) continue

    chunksWithTerms++

    for (const { term, definition } of terms) {
      toCreate.push({
        front: term,
        back: definition,
        performanceIndicatorId: chunk.performanceIndicatorId,
      })
    }
  }

  if (toCreate.length > 0) {
    const result = await prisma.flashcard.createMany({ data: toCreate })
    totalCreated = result.count
  }

  const total = await prisma.flashcard.count()
  console.log(`\nFlashcard generation complete.`)
  console.log(`  Chunks scanned:     ${chunks.length}`)
  console.log(`  Chunks with terms:  ${chunksWithTerms}`)
  console.log(`  Cards created:      ${totalCreated}`)
  console.log(`  Cards skipped:      ${totalSkipped}`)
  console.log(`  Total in DB:        ${total}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
