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
        <h1 className="text-2xl font-bold">Study</h1>
        <p className="text-gray-500">7 training modules, sequential learning path</p>
      </div>
      <div className="space-y-3">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={`/study/modules/${m.number}`}
            className="block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-indigo-600">
                  Module {m.number}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{m.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">{m.completion}%</span>
                <div className="mt-1 h-1.5 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500"
                    style={{ width: `${m.completion}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
