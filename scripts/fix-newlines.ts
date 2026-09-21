/**
 * Fix single-newline Markdown formatting in content chunks.
 *
 * Problems: The LLM generated content where:
 *   - Bold term definitions (**Term:**) and bullet items (- text) have
 *     single \n instead of \n\n → render as same paragraph
 *   - Practice question options (A. B. C. D.) are on single newlines
 *   - Some options have doubled prefixes ("A. A)" instead of "A)")
 *   - "Answer:" line has no blank line before it
 *
 * Fixes:
 *   1. Upgrade single \n to \n\n before **Term:** definitions
 *   2. Upgrade single \n to \n\n before bullet list items
 *   3. Defensive: ensure ## headings have \n\n before them
 *   4. Fix doubled option prefixes: "A. A)" → "A)"
 *   5. Upgrade single \n to \n\n before practice question options
 *   6. Ensure blank line before "Answer:" in practice questions
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

  // 4. Fix doubled option prefixes in practice questions:
  //    "A. A)" → "A)" and "A. A." → "A."
  //    The LLM sometimes emits "A. A) text" where "A." is the list marker
  //    and "A)" is the actual option label. Remove the redundant "X. " prefix.
  //    Only fires when the outer and inner letters match (e.g. "A. A" but not "A. B").
  result = result.replace(/([A-D])\.\s+([A-D])[.)](?=\s)/g, (match, outer: string, inner: string) => {
    if (outer === inner) {
      changes++
      return inner + (match[match.length - 1] === ')' ? ')' : '.')
    }
    return match
  })

  // 5. Upgrade single \n to \n\n before practice question options
  //    Only in the "## Practice Question" section to avoid false positives.
  //    Pattern: single \n followed by "X. " or "X)" at line start
  const pqIdx = result.indexOf('## Practice Question')
  if (pqIdx !== -1) {
    const before = result.substring(0, pqIdx)
    const section = result.substring(pqIdx)
    const fixedSection = section.replace(/(?<!\n)\n([A-D])[.)]\s/g, (_match, letter: string) => {
      changes++
      return '\n\n' + letter + '. '
    })
    result = before + fixedSection
  }

  // 6. Ensure blank line before "Answer:" in practice questions
  result = result.replace(/(?<!\n)\n(Answer:)/g, (_match, ans: string) => {
    changes++
    return '\n\n' + ans
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
