import type { DomainReadiness } from '@/types/dashboard'

export function DomainReadinessCard({ domain }: { domain: DomainReadiness }) {
  // Clay progress color: use the clay palette tokens
  const fillColor =
    domain.readiness >= 80 ? 'bg-clay-success' :
    domain.readiness >= 50 ? 'bg-clay-warning' :
    'bg-clay-danger'

  return (
    <div className="clay-card-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-clay-text/50">
            Domain {domain.romanNumeral}
          </p>
          <h3 className="font-display text-base font-semibold text-clay-text">{domain.title}</h3>
        </div>
        <span className="clay-badge bg-clay-primary/10 text-clay-primary">
          {domain.weightMin}-{domain.weightMax}%
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-clay-text">{domain.readiness}% ready</span>
          <span className="text-clay-text/50">
            {domain.completedPis}/{domain.totalPis} PIs
          </span>
        </div>
        <div className="clay-progress-track mt-2"
             role="progressbar" aria-valuenow={domain.readiness}
             aria-valuemin={0} aria-valuemax={100}
             aria-label={`Domain ${domain.romanNumeral} readiness`}>
          <div
            className={`clay-progress-fill ${fillColor}`}
            style={{ width: `${domain.readiness}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-clay-text/50">
        Avg confidence: {domain.avgConfidence}/5
      </p>
    </div>
  )
}
