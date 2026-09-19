import { StructureMarker } from './pdf-parser-types'

const PAGE_MARKER = /^--\s*(\d+)\s+of\s+(\d+)\s*--$/
const SECTION_HEADER = /^AIGP\s+Domain\s+[IVXLC]+\s*:\s*Competencies/i

export function detectStructure(text: string, startPage: number): StructureMarker[] {
  const markers: StructureMarker[] = []
  const lines = text.split('\n')

  let currentPage = startPage
  let currentDomain: StructureMarker | null = null
  let currentComp: StructureMarker | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    const pageMatch = line.match(PAGE_MARKER)
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10)
      continue
    }

    if (!SECTION_HEADER.test(line)) {
      const domainMatch = line.match(/^AIGP\s+Domain\s+([IVXLC]+)\s*:\s*(.+)$/)
      if (domainMatch) {
        currentDomain = {
          type: 'domain',
          level: 1,
          code: domainMatch[1],
          title: domainMatch[2].trim(),
          pageNumber: currentPage,
        }
        currentComp = null
        markers.push(currentDomain)
        continue
      }
    }

    const compMatch = line.match(/^Competency\s*:\s*\(([^)]+)\)\s*$/)
    if (compMatch) {
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
      const titleLine =
        nextLine && !nextLine.startsWith('Performance') ? nextLine : ''
      currentComp = {
        type: 'competency',
        level: 2,
        code: compMatch[1],
        title: titleLine,
        pageNumber: currentPage,
      }
      markers.push(currentComp)
      continue
    }

    if (/^Performance\s+Indicators(\s*\(Continued\))?\s*$/i.test(line)) {
      continue
    }

    if (
      line.startsWith('●') ||
      line.startsWith('○') ||
      line.startsWith('■') ||
      line.startsWith('□')
    ) {
      const description = line.replace(/^[●○■□]\s*/, '').trim()
      if (!description) continue
      const parent = currentComp ?? currentDomain
      if (!parent) continue
      const seq =
        markers.filter(
          (m) => m.type === 'performance-indicator' && m.code.startsWith(parent.code + '.')
        ).length + 1
      markers.push({
        type: 'performance-indicator',
        level: 3,
        code: `${parent.code}.${seq}`,
        title: description,
        pageNumber: currentPage,
      })
    }
  }

  return markers
}
