'use client'

import { useState } from 'react'
import type { CompetencyDetail, PIDetail } from '@/types/study'

export function CompetencyTree({
  competencies,
  selectedPI,
  onSelectPI,
}: {
  competencies: CompetencyDetail[]
  selectedPI: number | null
  onSelectPI: (pi: PIDetail) => void
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {competencies.map((comp) => (
        <div key={comp.id} className="rounded-lg border bg-white">
          <button
            onClick={() => toggle(comp.id)}
            className="flex w-full items-center justify-between p-3 text-left"
          >
            <div>
              <span className="font-mono text-sm font-semibold text-indigo-600">
                {comp.code}
              </span>
              <span className="ml-2 text-sm font-medium text-gray-900">{comp.title}</span>
            </div>
            <span className="text-xs text-gray-500">{comp.performanceIndicators.length} PIs</span>
          </button>
          {expanded.has(comp.id) && (
            <div className="border-t px-3 py-2">
              <p className="mb-2 text-xs text-gray-600">{comp.description}</p>
              <ul className="space-y-1">
                {comp.performanceIndicators.map((pi) => (
                  <li key={pi.id}>
                    <button
                      onClick={() => onSelectPI(pi)}
                      className={`w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                        selectedPI === pi.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-mono">{pi.code}</span> — {pi.description}
                      {pi.progress?.status === 'done' && (
                        <span className="ml-1 text-green-600">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
