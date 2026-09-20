export interface DomainCompetency {
  code: string
  title: string
  moduleNumber: number
  pis: { code: string; description: string; status: string; confidence: number }[]
}

export interface DomainDetail {
  id: number
  romanNumeral: string
  title: string
  weightMin: number
  weightMax: number
  description: string
  modules: { number: number; title: string }[]
  competencies: DomainCompetency[]
  readiness: number
}
