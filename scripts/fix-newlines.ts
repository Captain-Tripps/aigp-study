/**
 * Fix single-newline Markdown formatting in content chunks.
 *
 * Problem: The LLM generated content where bold term definitions
 * (**Term:**) and bullet list items (- **text**) are preceded by a
 * single \n instead of \n\n. In standard Markdown, a single newline
 * does NOT create a line break — items render as the same paragraph.
 *
 * Fix: Upgrade single \n to \n\n before:
 *   1. **Term:** definitions (bold text followed by colon)
 *   2. - bullet list items
 *   3. ## headings (shouldn't be needed but defensive)
 *
 * Usage: npx tsx scripts/fix-newlines.ts [--dry-run]
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes('--dry-run')

function fixMarkdownNewlines(content: string): { fixed: string; changes: number } {
  let changes = 0
  let result = content

  // 1. Upgrade single \n to \n\n before bold term definitions: **Word:**
  //    Pattern: a newline followed by **text:** where text doesn't start with a space
  //    We need to ensure it's NOT already \n\n
  result = result.replace(/(?<!\n)\n(\*\*[^*\n]+:\*\*)/g, (_match, bold: string, offset: number) => {
    changes++
    return '\n\n' + bold
  })

  // 2. Upgrade single \n to \n\n before bullet list items: - text
  //    Only when the bullet is a term definition (starts with - ** or - plain text after a non-bullet line)
  result = result.replace(/(?<!\n)\n(- )/g, (_match, bullet: string) => {
    changes++
    return '\n\n' + bullet
  })

  // 3. Defensive: ensure ## headings have \n\n before them
  result = result.replace(/(?<!\n)\n(## )/g, (_match, heading: string) => {
    changes++
    return '\n\n' + heading
  })

  // Clean up any accidental triple+ newlines down to double
  result = result.replace(/\n{3,}/g, '\n\n')

  return { fixed: result, changes }
}

async function main() {
  const chunks = await prisma.contentChunk.findMany({
    select: { id: true, title: true, content: true, sourceType: true },
    orderBy: { id: 'asc' },
  })

  let totalFixed = 0
  let totalChanges = 0
  let affectedCount = 0

  for (const chunk of chunks) {
    if (!chunk.content) continue

    const { fixed, changes } = fixMarkdownNewlines(chunk.content)

    if (changes > 0) {
      affectedCount++
      totalChanges += changes
      if (!DRY_RUN) {
        await prisma.contentChunk.update({
          where: { id: chunk.id },
          data: { content: fixed },
        })
      }
      if (process.argv.includes('--verbose')) {
        console.log(`  Chunk ${chunk.id} (${chunk.title}): ${changes} fixes`)
      }
    }
  }

  console.log(`\n${DRY_RUN ? 'DRY RUN' : 'EXECUTED'} — Markdown newline fixes`)
  console.log(`  Total chunks scanned: ${chunks.length}`)
  console.log(`  Chunks affected:      ${affectedCount}`)
  console.log(`  Total newline fixes:  ${totalChanges}`)

  if (!DRY_RUN) {
    console.log(`  Database updated.`)
  }

  await prisma.$disconnect()
}

main()
