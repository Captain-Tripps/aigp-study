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
        <div key={w.week} className="clay-card-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-clay-text">
              Week {w.week}: {new Date(w.startDate).toLocaleDateString()} — {new Date(w.endDate).toLocaleDateString()}
            </h3>
            <span className="text-xs text-clay-text/50">
              {w.dailyHours.toFixed(1)} hrs/day
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.modules.map((m) => (
              <span key={m.number} className="clay-badge bg-clay-primary/10 text-clay-primary">
                M{m.number}: {m.title}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.domainMilestones.map((d) => (
              <span key={d.romanNumeral} className="clay-badge bg-clay-text/5 text-clay-text/70">
                Domain {d.romanNumeral}: {d.targetReadiness}%
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
