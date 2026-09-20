import type { DomainDetail } from '@/types/domain'

type CompetencyRow = DomainDetail['competencies'][number]

export function CompetencyMatrix({ competencies }: { competencies: CompetencyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
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
              done === comp.pis.length ? 'text-green-600' :
              done > 0 ? 'text-yellow-600' : 'text-gray-400'
            return (
              <tr key={comp.code} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-indigo-600">{comp.code}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{comp.title}</td>
                <td className="px-3 py-2 text-gray-600">M{comp.moduleNumber}</td>
                <td className="px-3 py-2 text-gray-600">{done}/{comp.pis.length}</td>
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
