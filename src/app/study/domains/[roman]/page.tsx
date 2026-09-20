'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CompetencyMatrix } from '@/components/domain/CompetencyMatrix'
import type { DomainDetail } from '@/types/domain'

export default function DomainPage() {
  const { roman } = useParams()
  const [domain, setDomain] = useState<DomainDetail | null>(null)

  useEffect(() => {
    fetch(`/api/study/domains/${roman}`)
      .then((r) => r.json())
      .then(setDomain)
  }, [roman])

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

      <CompetencyMatrix competencies={domain.competencies} />
    </div>
  )
}
