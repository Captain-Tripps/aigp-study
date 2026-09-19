'use client'

import { useEffect, useState } from 'react'
import { DomainReadinessCard } from '@/components/dashboard/DomainReadinessCard'
import { ModuleProgressRing } from '@/components/dashboard/ModuleProgressRing'
import type { DomainReadiness, ModuleProgress } from '@/types/dashboard'

interface DashboardData {
  domains: DomainReadiness[]
  modules: ModuleProgress[]
  nextActions: string[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-red-500">Error: {error}</p>
  if (!data) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Your AIGP exam readiness at a glance</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Exam Domain Readiness</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.domains.map((d) => (
            <DomainReadinessCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Module Progress</h2>
        <div className="flex flex-wrap gap-4">
          {data.modules.map((m) => (
            <ModuleProgressRing key={m.id} module={m} />
          ))}
        </div>
      </section>

      {data.nextActions.length > 0 && (
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Next Actions</h2>
          <ul className="list-inside list-disc text-sm text-gray-700">
            {data.nextActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
