'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CompetencyMatrix } from '@/components/domain/CompetencyMatrix'
import type { DomainDetail } from '@/types/domain'

export default function DomainPage() {
  const { roman } = useParams()
  const [domain, setDomain] = useState<DomainDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    fetch(`/api/study/domains/${roman}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${r.status})`)
          return
        }
        setDomain(await r.json())
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [roman])

  if (error) {
    return (
      <div className="clay-card text-center">
        <p className="text-clay-danger">{error}</p>
        <button onClick={load} className="clay-btn mt-3">
          Retry
        </button>
      </div>
    )
  }
  if (!domain) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="clay-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-clay-primary">
              Domain {domain.romanNumeral}
            </p>
            <h1 className="text-2xl font-bold text-clay-text">{domain.title}</h1>
          </div>
          <div className="text-right">
            <span className="clay-badge bg-clay-primary/10 text-clay-primary">
              {domain.weightMin}-{domain.weightMax}%
            </span>
            <p className="mt-1 text-sm text-clay-text/70">{domain.readiness}% ready</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-clay-text/70">{domain.description}</p>
        <p className="mt-2 text-xs text-clay-text/50">
          Modules: {domain.modules.map((m) => `M${m.number}`).join(', ')}
        </p>
      </div>

      {domain.competencies.length === 0 ? (
        <div className="clay-card text-clay-text/50">
          No competencies mapped to this domain yet.
        </div>
      ) : (
        <CompetencyMatrix competencies={domain.competencies} />
      )}
    </div>
  )
}
