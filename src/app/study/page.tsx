'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ModuleSummary } from '@/types/study'

export default function StudyPage() {
  const [modules, setModules] = useState<ModuleSummary[]>([])

  useEffect(() => {
    fetch('/api/study/modules')
      .then((r) => r.json())
      .then(setModules)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Study</h1>
        <p className="text-clay-text/50">7 training modules, sequential learning path</p>
      </div>
      <div className="space-y-3">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={`/study/modules/${m.number}`}
            className="clay-card-sm block transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-clay-primary">
                  Module {m.number}
                </span>
                <h2 className="text-lg font-semibold text-clay-text">{m.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-clay-text/80">{m.completion}%</span>
                <div className="clay-progress-track mt-1 w-32">
                  <div
                    className="clay-progress-fill bg-clay-primary"
                    style={{ width: `${m.completion}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm text-clay-text/70">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
