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
      <div className="clay-card text-center">
        <p className="text-clay-danger">{error}</p>
        <button onClick={load} className="clay-btn mt-3">
          Retry
        </button>
      </div>
    )
  }
  if (!module) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-clay-primary">Module {module.number}</p>
        <h1 className="text-2xl font-bold text-clay-text">{module.title}</h1>
        <p className="mt-1 text-clay-text/70">{module.description}</p>
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
              <div className="clay-card text-center text-clay-text/50">
                No content yet. Add study content for this performance indicator.
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-clay-text">
                  <span className="font-mono font-medium text-clay-primary">{selectedPI.code}</span> — {selectedPI.description}
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
            <div className="clay-card text-center text-clay-text/50">
              Select a performance indicator to view content
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
