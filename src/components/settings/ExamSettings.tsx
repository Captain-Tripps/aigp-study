'use client'

import { useEffect, useState } from 'react'

export function ExamSettings() {
  const [examDate, setExamDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/planner')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setExamDate(new Date(data.examDate).toISOString().split('T')[0])
          setWeeklyHours(data.weeklyHours)
        }
      })
  }, [])

  const save = async () => {
    setError(null)
    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examDate, weeklyHours }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      setError(err?.error || `Request failed (HTTP ${res.status})`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="clay-card-sm space-y-4">
      <h2 className="text-lg font-semibold text-clay-text">Exam Settings</h2>
      <div>
        <label className="text-sm font-medium text-clay-text/80">Target Exam Date</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="clay-input mt-1 block"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-clay-text/80">Weekly Study Hours</label>
        <input
          type="number"
          min="4"
          max="20"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
          className="clay-input mt-1 block w-24"
        />
      </div>
      <button
        onClick={save}
        className="clay-btn"
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
      {error && <p className="text-clay-danger text-sm">{error}</p>}
    </div>
  )
}
