import { ContentChunk, StructureMarker } from './pdf-parser-types'

export function extractContentChunks(
  markers: StructureMarker[],
  fullText: string
): ContentChunk[] {
  const chunks: ContentChunk[] = []
  const lines = fullText.split('\n')

  for (const marker of markers) {
    if (marker.type !== 'performance-indicator') continue

    const startIdx = findMarkerLine(lines, marker)
    if (startIdx === -1) continue

    let content = ''
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (isBoundary(trimmed)) break
      content += (content ? '\n' : '') + line
    }

    content = content.replace(/\n{3,}/g, '\n\n').trim()
    if (!content) continue

    chunks.push({
      type: classifyContent(content),
      title: marker.title,
      content,
      sourcePage: marker.pageNumber,
    })
  }

  return chunks
}

function findMarkerLine(lines: string[], marker: StructureMarker): number {
  const titleStart = marker.title.slice(0, 20)
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (
      (trimmed.startsWith('●') ||
        trimmed.startsWith('○') ||
        trimmed.startsWith('■') ||
        trimmed.startsWith('□')) &&
      trimmed.slice(1).trim().startsWith(titleStart)
    ) {
      return i
    }
  }
  return -1
}

function isBoundary(line: string): boolean {
  return (
    /^--\s*\d+\s+of\s+\d+\s*--$/.test(line) ||
    /^AIGP\s+Domain\s+[IVXLC]+\s*:/i.test(line) ||
    /^Competency\s*:/i.test(line) ||
    /^Performance\s+Indicators(\s*\(Continued\))?\s*$/i.test(line) ||
    line.startsWith('●') ||
    line.startsWith('○') ||
    line.startsWith('■') ||
    line.startsWith('□')
  )
}

function classifyContent(content: string): ContentChunk['type'] {
  if (/\*\*(Definition|Meaning)/im.test(content)) return 'definition'
  if (content.includes('|---') || content.includes('| --')) return 'table'
  if (/^\*\*Example/im.test(content)) return 'example'
  if (/^[●○■□-]\s+/m.test(content)) return 'list'
  return 'explanation'
}
