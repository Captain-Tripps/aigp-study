import type { ModuleProgress } from '@/types/dashboard'

export function ModuleProgressRing({ module }: { module: ModuleProgress }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (module.completion / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90" role="img"
           aria-label={`Module M${module.number} ${module.completion}% complete`}>
        {/* Track: subtle sunken ring */}
        <circle cx="45" cy="45" r={radius} fill="none"
                className="stroke-clay-track" strokeWidth="8" />
        {/* Progress: clay primary */}
        <circle
          cx="45" cy="45" r={radius} fill="none"
          className="stroke-clay-primary" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
              className="fill-clay-text text-sm font-bold">
          {module.completion}%
        </text>
      </svg>
      <p className="mt-2 text-center text-xs font-semibold text-clay-text/80">
        M{module.number}
      </p>
      <p className="text-center text-xs text-clay-text/50 line-clamp-2 max-w-[100px]">
        {module.title}
      </p>
    </div>
  )
}
