import type { ModuleProgress } from '@/types/dashboard'

export function ModuleProgressRing({ module }: { module: ModuleProgress }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (module.completion / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={radius} fill="none"
          stroke="#6366f1" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
          className="fill-gray-900 text-sm font-bold">
          {module.completion}%
        </text>
      </svg>
      <p className="mt-1 text-center text-xs font-medium text-gray-700">
        M{module.number}
      </p>
      <p className="text-center text-xs text-gray-500 line-clamp-2 max-w-[100px]">
        {module.title}
      </p>
    </div>
  )
}
