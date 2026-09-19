import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { detectStructure } from './structure-detector'
import { extractContentChunks } from './content-extractor'
import { ParsedModule, ParsedCompetency, ParsedPI, ContentChunk } from './pdf-parser-types'

export * from './pdf-parser-types'

export async function parsePdf(pdfPath: string): Promise<ParsedModule[]> {
  const buffer = fs.readFileSync(pdfPath)
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  await parser.destroy()
  const rawText = (result as unknown as { text?: string }).text ?? (result as unknown as string)

  const markers = detectStructure(rawText, 1)
  const chunks = extractContentChunks(markers, rawText)

  const chunksByCode = new Map<string, ContentChunk[]>()
  for (const c of chunks) {
    const code = chunksByCode.get(c.title)
    if (code) code.push(c)
    else chunksByCode.set(c.title, [c])
  }

  const modules: ParsedModule[] = []
  const domainMarkers = markers.filter((m) => m.type === 'domain')

  for (let i = 0; i < domainMarkers.length; i++) {
    const domain = domainMarkers[i]
    const nextDomain = domainMarkers[i + 1]

    const compMarkers = markers.filter(
      (m) =>
        m.type === 'competency' &&
        m.code.startsWith(domain.code + '.') &&
        (!nextDomain || m.pageNumber < nextDomain.pageNumber)
    )

    const competencies: ParsedCompetency[] = compMarkers.map((comp) => {
      const piMarkers = markers.filter(
        (m) => m.type === 'performance-indicator' && m.code.startsWith(comp.code + '.')
      )
      const pis: ParsedPI[] = piMarkers.map((pi) => ({
        code: pi.code,
        description: pi.title,
        contentChunks: chunksByCode.get(pi.title) ?? [],
      }))
      return {
        code: comp.code,
        title: comp.title,
        description: comp.title,
        performanceIndicators: pis,
      }
    })

    modules.push({
      moduleNumber: romanToNumber(domain.code),
      title: domain.title,
      competencies,
    })
  }

  return modules
}

export function romanToNumber(roman: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 }
  let result = 0
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i]]
    const next = map[roman[i + 1]]
    if (next && next > current) result -= current
    else result += current
  }
  return result
}
