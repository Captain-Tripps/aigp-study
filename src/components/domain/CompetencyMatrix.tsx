import type { DomainDetail } from '@/types/domain'

type CompetencyRow = DomainDetail['competencies'][number]

export function CompetencyMatrix({ competencies }: { competencies: CompetencyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-clay bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-clay-primary/5 text-left text-xs font-medium text-clay-text/50">
            <th className="px-3 py-2">Code</th>
            <th className="px-3 py-2">Competency</th>
            <th className="px-3 py-2">Module</th>
            <th className="px-3 py-2">PIs</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {competencies.map((comp) => {
            const done = comp.pis.filter((pi) => pi.status === 'done').length
            const statusColor =
              done === comp.pis.length ? 'text-clay-success' :
              done > 0 ? 'text-clay-warning' : 'text-clay-text/30'
            return (
              <tr key={comp.code} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono font-medium text-clay-primary">{comp.code}</td>
                <td className="px-3 py-2 font-medium text-clay-text">{comp.title}</td>
                <td className="px-3 py-2 text-clay-text/70">M{comp.moduleNumber}</td>
                <td className="px-3 py-2 text-clay-text/70">{done}/{comp.pis.length}</td>
                <td className={`px-3 py-2 font-medium ${statusColor}`}>
                  {done === comp.pis.length ? 'Complete' : done > 0 ? 'In progress' : 'Not started'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
