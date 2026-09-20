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
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-red-600">{error}</p>
        <button onClick={load} className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          Retry
        </button>
      </div>
    )
  }
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
