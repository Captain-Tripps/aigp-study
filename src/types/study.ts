export interface ModuleSummary {
  id: number
  number: number
  title: string
  description: string
  completion: number
  totalPis: number
}

export interface ChunkDetail {
  id: number
  type: string
  title: string
  content: string
  sourcePage: number | null
  sourceType: string
  sourceUrl: string | null
  isEdited: boolean
  editedContent: string | null
}

export interface PIDetail {
  id: number
  code: string
  description: string
  competencyId: number
  chunks: ChunkDetail[]
  progress: { status: string; confidence: number } | null
}

export interface CompetencyDetail {
  id: number
  code: string
  title: string
  description: string
  performanceIndicators: PIDetail[]
}

export interface ModuleDetail {
  id: number
  number: number
  title: string
  description: string
  competencies: CompetencyDetail[]
}
