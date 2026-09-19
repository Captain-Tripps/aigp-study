import type { DomainReadiness } from '@/types/dashboard'

export function DomainReadinessCard({ domain }: { domain: DomainReadiness }) {
  const color =
    domain.readiness >= 80 ? 'bg-green-500' :
    domain.readiness >= 50 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Domain {domain.romanNumeral}
          </p>
          <h3 className="text-lg font-semibold text-gray-900">{domain.title}</h3>
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {domain.weightMin}-{domain.weightMax}%
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{domain.readiness}% ready</span>
          <span className="text-gray-500">
            {domain.completedPis}/{domain.totalPis} PIs
          </span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${domain.readiness}%` }}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Avg confidence: {domain.avgConfidence}/5
      </p>
    </div>
  )
}
