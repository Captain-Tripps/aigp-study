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

  const generate = async () => {
    if (!examDate) return
    setLoading(true)
    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examDate, weeklyHours }),
    })
    const data = await res.json()
    setPlan(data)
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/planner')
      .then((r) => r.json())
      .then((data) => { if (data) setPlan(data) })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Planner</h1>
        <p className="text-gray-500">Generate an 8-12 week study schedule</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="mt-1 block rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Hours/Week</label>
          <input
            type="number"
            min="4"
            max="20"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
            className="mt-1 block w-20 rounded border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading || !examDate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>

      {plan && <CalendarView weeks={plan.weeks} />}
    </div>
  )
}
