'use client'

import { useState } from 'react'

interface Progress {
  status: string
  confidence: number
}

export function ProgressActions({
  piId,
  progress,
  onUpdated,
}: {
  piId: number
  progress: Progress | null
  onUpdated: (p: Progress) => void
}) {
  const [status, setStatus] = useState(progress?.status || 'not_started')
  const [confidence, setConfidence] = useState(progress?.confidence || 0)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ piId, status, confidence }),
    })
    setSaving(false)
    onUpdated({ status, confidence })
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-white p-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ml-2 rounded border px-2 py-1 text-sm"
        >
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Confidence</label>
        <input
          type="range"
          min="0"
          max="5"
          value={confidence}
          onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
          className="ml-2 w-24"
        />
        <span className="ml-1 text-sm font-medium">{confidence}/5</span>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
