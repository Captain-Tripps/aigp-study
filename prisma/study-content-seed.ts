// Usage: npx tsx prisma/study-content-seed.ts [export|import]
//
// "export" mode: reads all manual ContentChunks from the DB and writes
//   them to prisma/study-content.json
// "import" mode: reads prisma/study-content.json and upserts into the DB

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const OUTPUT_FILE = path.join(__dirname, 'study-content.json')

interface StudyContentRecord {
  title: string
  content: string
  sourceType: string
  type: string
  performanceIndicatorId: number
  isEdited: boolean
}

async function exportContent() {
  const chunks = await prisma.contentChunk.findMany({
    where: { sourceType: 'manual' },
    orderBy: { title: 'asc' },
  })

  const data: StudyContentRecord[] = chunks.map((c) => ({
    title: c.title,
    content: c.content,
    sourceType: c.sourceType,
    type: c.type,
    performanceIndicatorId: c.performanceIndicatorId,
    isEdited: c.isEdited,
  }))

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2))
  console.log(`Exported ${data.length} content chunks to ${OUTPUT_FILE}`)
}

async function importContent() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    console.error(`File not found: ${OUTPUT_FILE}`)
    process.exit(1)
  }

  const data: StudyContentRecord[] = JSON.parse(
    fs.readFileSync(OUTPUT_FILE, 'utf-8')
  )

  let imported = 0
  let skipped = 0

  for (const record of data) {
    const pi = await prisma.performanceIndicator.findUnique({
      where: { id: record.performanceIndicatorId },
    })
    if (!pi) {
      console.warn(`Skipping ${record.title}: PI ${record.performanceIndicatorId} not found`)
      skipped++
      continue
    }

    const existing = await prisma.contentChunk.findFirst({
      where: {
        title: record.title,
        sourceType: 'manual',
        performanceIndicatorId: record.performanceIndicatorId,
      },
    })

    if (existing) {
      await prisma.contentChunk.update({
        where: { id: existing.id },
        data: {
          content: record.content,
          isEdited: true,
        },
      })
    } else {
      await prisma.contentChunk.create({
        data: {
          title: record.title,
          content: record.content,
          sourceType: record.sourceType,
          type: record.type,
          performanceIndicatorId: record.performanceIndicatorId,
          isEdited: record.isEdited,
        },
      })
    }
    imported++
  }

  console.log(`Imported ${imported}, skipped ${skipped} content chunks from ${OUTPUT_FILE}`)
}

const mode = process.argv[2] || 'export'

if (mode === 'export') {
  exportContent()
} else if (mode === 'import') {
  importContent()
} else {
  console.error(`Unknown mode: ${mode}. Use "export" or "import".`)
  process.exit(1)
}

prisma.$disconnect()
