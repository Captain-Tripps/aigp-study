'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CompetencyTree } from '@/components/study/CompetencyTree'
import { ContentPanel } from '@/components/study/ContentPanel'
import { ProgressActions } from '@/components/study/ProgressActions'
import type { ModuleDetail, PIDetail } from '@/types/study'

export default function ModuleDetailPage() {
  const { number } = useParams()
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [selectedPI, setSelectedPI] = useState<PIDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    fetch(`/api/study/modules/${number}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${r.status})`)
          return
        }
        setModule(await r.json())
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [number])

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
  if (!module) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">Module {module.number}</p>
        <h1 className="text-2xl font-bold">{module.title}</h1>
        <p className="mt-1 text-gray-600">{module.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CompetencyTree
            competencies={module.competencies}
            selectedPI={selectedPI?.id ?? null}
            onSelectPI={setSelectedPI}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedPI ? (
            selectedPI.chunks.length === 0 ? (
              <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
                No content yet. Add study content for this performance indicator.
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  <span className="font-mono text-indigo-600">{selectedPI.code}</span> — {selectedPI.description}
                </h2>
                <ContentPanel chunks={selectedPI.chunks} />
                <ProgressActions
                  piId={selectedPI.id}
                  progress={selectedPI.progress}
                  onUpdated={(p) => setSelectedPI((prev) => prev ? { ...prev, progress: p } : null)}
                />
              </div>
            )
          ) : (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
              Select a performance indicator to view content
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
