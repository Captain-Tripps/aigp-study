export interface StructureMarker {
  type: 'domain' | 'competency' | 'performance-indicator'
  level: number
  code: string
  title: string
  pageNumber: number
  description?: string
}

export interface ParsedModule {
  moduleNumber: number
  title: string
  competencies: ParsedCompetency[]
}

export interface ParsedCompetency {
  code: string
  title: string
  description: string
  performanceIndicators: ParsedPI[]
}

export interface ParsedPI {
  code: string
  description: string
  contentChunks: ContentChunk[]
}

export interface ContentChunk {
  type: 'definition' | 'explanation' | 'example' | 'table' | 'list'
  title: string
  content: string
  sourcePage: number
}

export interface IngestionResult {
  modulesCreated: number
  competenciesCreated: number
  pisCreated: number
  chunksCreated: number
  errors: string[]
}
