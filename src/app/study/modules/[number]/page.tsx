'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CompetencyTree } from '@/components/study/CompetencyTree'
import { ContentPanel } from '@/components/study/ContentPanel'
import type { ModuleDetail, PIDetail } from '@/types/study'

export default function ModuleDetailPage() {
  const { number } = useParams()
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [selectedPI, setSelectedPI] = useState<PIDetail | null>(null)

  useEffect(() => {
    fetch(`/api/study/modules/${number}`)
      .then((r) => r.json())
      .then(setModule)
  }, [number])

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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                <span className="font-mono text-indigo-600">{selectedPI.code}</span> — {selectedPI.description}
              </h2>
              <ContentPanel chunks={selectedPI.chunks} />
            </div>
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
