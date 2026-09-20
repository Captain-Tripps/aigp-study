interface WeekPlan {
  week: number
  startDate: Date
  endDate: Date
  modules: { number: number; title: string; hours: number }[]
  domainMilestones: { romanNumeral: string; targetReadiness: number }[]
  dailyHours: number
}

export function CalendarView({ weeks }: { weeks: WeekPlan[] }) {
  return (
    <div className="space-y-3">
      {weeks.map((w) => (
        <div key={w.week} className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Week {w.week}: {w.startDate.toLocaleDateString()} — {w.endDate.toLocaleDateString()}
            </h3>
            <span className="text-xs text-gray-500">
              {w.dailyHours.toFixed(1)} hrs/day
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.modules.map((m) => (
              <span key={m.number} className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                M{m.number}: {m.title}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.domainMilestones.map((d) => (
              <span key={d.romanNumeral} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Domain {d.romanNumeral}: {d.targetReadiness}%
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
