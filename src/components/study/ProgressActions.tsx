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
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ piId, status, confidence }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      setError(err?.error || `Failed to save (HTTP ${res.status})`)
      setSaving(false)
      return
    }
    setError(null)
    setSaving(false)
    onUpdated({ status, confidence })
  }

  return (
    <div className="clay-card-sm flex items-center gap-4">
      <div>
        <label className="text-xs font-medium text-clay-text/70">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="ml-2 clay-input"
        >
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-clay-text/70">Confidence</label>
        <input
          type="range"
          min="0"
          max="5"
          value={confidence}
          onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
          className="ml-2 w-24"
        />
        <span className="ml-1 text-sm font-medium text-clay-text">{confidence}/5</span>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="clay-btn"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      {error && <p className="text-clay-danger text-sm">{error}</p>}
    </div>
  )
}
