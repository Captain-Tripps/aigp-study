'use client'

import { useEffect, useState } from 'react'

export function ExamSettings() {
  const [examDate, setExamDate] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(10)
  const [saved, setSaved] = useState(false)

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
    await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examDate, weeklyHours }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Exam Settings</h2>
      <div>
        <label className="text-sm font-medium text-gray-700">Target Exam Date</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="mt-1 block rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Weekly Study Hours</label>
        <input
          type="number"
          min="4"
          max="20"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
          className="mt-1 block w-24 rounded border px-3 py-2 text-sm"
        />
      </div>
      <button
        onClick={save}
        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
