'use client'

import { useEffect, useState } from 'react'
import { CalendarView } from '@/components/planner/CalendarView'

interface WeekPlan {
  week: number
  startDate: Date
  endDate: Date
  modules: { number: number; title: string; hours: number }[]
  domainMilestones: { romanNumeral: string; targetReadiness: number }[]
  dailyHours: number
}

interface PlanData {
  examDate: string
  weeklyHours: number
  startDate: string
  totalWeeks: number
  weeks: WeekPlan[]
}

export default function PlannerPage() {
  const [examDate, setExamDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!examDate) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examDate, weeklyHours }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      setError(err?.error || `Request failed (HTTP ${res.status})`)
      setLoading(false)
      return
    }
    const data = await res.json()
    setPlan(data)
    setLoading(false)
  }

  useEffect(() => {
    setError(null)
    fetch('/api/planner')
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null)
          setError(err?.error || `Request failed (HTTP ${r.status})`)
          return
        }
        const data = await r.json()
        if (data) setPlan(data)
      })
      .finally(() => setInitialLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clay-text">Study Planner</h1>
        <p className="text-clay-text/50">Generate an 8-12 week study schedule</p>
      </div>

      <div className="clay-card-sm flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm font-medium text-clay-text/80">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="clay-input mt-1 block"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-clay-text/80">Hours/Week</label>
          <input
            type="number"
            min="4"
            max="20"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
            className="clay-input mt-1 block w-20"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading || !examDate}
          className="clay-btn disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>

      {error ? (
        <div className="clay-card text-center">
          <p className="text-clay-danger">{error}</p>
          <button onClick={generate} className="clay-btn mt-3">
            Retry
          </button>
        </div>
      ) : plan ? (
        <CalendarView weeks={plan.weeks} />
      ) : initialLoading ? (
        <p className="text-clay-text/50">Loading...</p>
      ) : (
        <div className="clay-card text-clay-text/50">
          Generate a plan to get started.
        </div>
      )}
    </div>
  )
}
