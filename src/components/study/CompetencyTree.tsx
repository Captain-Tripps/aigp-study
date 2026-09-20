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
        <div key={comp.id} className="clay-card-sm">
          <button
            onClick={() => toggle(comp.id)}
            className="flex w-full items-center justify-between p-3 text-left"
          >
            <div>
              <span className="font-mono text-sm font-medium text-clay-primary">
                {comp.code}
              </span>
              <span className="ml-2 text-sm font-medium text-clay-text">{comp.title}</span>
            </div>
            <span className="text-xs text-clay-text/50">{comp.performanceIndicators.length} PIs</span>
          </button>
          {expanded.has(comp.id) && (
            <div className="border-t px-3 py-2">
              <p className="mb-2 text-xs text-clay-text/70">{comp.description}</p>
              <ul className="space-y-1">
                {comp.performanceIndicators.map((pi) => (
                  <li key={pi.id}>
                    <button
                      onClick={() => onSelectPI(pi)}
                      className={`w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                        selectedPI === pi.id
                          ? 'bg-clay-primary/10 text-clay-primary'
                          : 'text-clay-text/70 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-mono">{pi.code}</span> — {pi.description}
                      {pi.progress?.status === 'done' && (
                        <span className="ml-1 text-clay-success">✓</span>
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
