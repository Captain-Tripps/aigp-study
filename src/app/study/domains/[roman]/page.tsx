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
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-red-600">{error}</p>
        <button onClick={load} className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          Retry
        </button>
      </div>
    )
  }
  if (!domain) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Domain {domain.romanNumeral}
            </p>
            <h1 className="text-2xl font-bold">{domain.title}</h1>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              {domain.weightMin}-{domain.weightMax}%
            </span>
            <p className="mt-1 text-sm text-gray-600">{domain.readiness}% ready</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{domain.description}</p>
        <p className="mt-2 text-xs text-gray-500">
          Modules: {domain.modules.map((m) => `M${m.number}`).join(', ')}
        </p>
      </div>

      {domain.competencies.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          No competencies mapped to this domain yet.
        </div>
      ) : (
        <CompetencyMatrix competencies={domain.competencies} />
      )}
    </div>
  )
}
