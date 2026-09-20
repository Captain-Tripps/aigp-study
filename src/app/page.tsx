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
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    fetch('/api/dashboard')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${res.status})`)
          return
        }
        setData(await res.json())
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [])

  if (error) {
    return (
      <div className="clay-card mx-auto max-w-md text-center">
        <p className="text-clay-danger font-medium">{error}</p>
        <button onClick={load} className="clay-btn mt-4">
          Retry
        </button>
      </div>
    )
  }
  if (!data) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-clay-text">Dashboard</h1>
        <p className="mt-1 text-clay-text/60">Your AIGP exam readiness at a glance</p>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-clay-text">Exam Domain Readiness</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.domains.map((d) => (
            <DomainReadinessCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-clay-text">Module Progress</h2>
        <div className="flex flex-wrap gap-6">
          {data.modules.map((m) => (
            <ModuleProgressRing key={m.id} module={m} />
          ))}
        </div>
      </section>

      {data.nextActions.length > 0 && (
        <section className="clay-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-clay-text">Next Actions</h2>
          <ul className="list-inside list-disc text-sm text-clay-text/80 space-y-1">
            {data.nextActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
