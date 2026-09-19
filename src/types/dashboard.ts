export interface DomainReadiness {
  id: number
  romanNumeral: string
  title: string
  weightMin: number
  weightMax: number
  readiness: number
  completedPis: number
  totalPis: number
  avgConfidence: number
}

export interface ModuleProgress {
  id: number
  number: number
  title: string
  completion: number
  completedPis: number
  totalPis: number
  avgConfidence: number
}
