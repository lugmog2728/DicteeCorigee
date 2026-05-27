import type { PlanificationDetail } from '../../../api/planifications'
import PlanningTableRow from './PlanningTableRow'

interface PlanningTableProps {
  planifications: PlanificationDetail[]
}

const HEADERS = ['Dictée', 'Classe', 'Date prévue', 'Progression', 'Statut', 'Actions']

export default function PlanningTable({ planifications }: PlanningTableProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-[18px] font-medium text-black">Dictées planifiées</h2>
      </div>

      {planifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <p className="text-[14px] font-medium text-[#364153]">Aucune planification pour l'instant</p>
          <p className="text-[12px] text-[#6a7282]">Cliquez sur "Planifier une dictée" pour commencer</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[12px] font-medium text-[#6a7282] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planifications.map((p) => (
                <PlanningTableRow key={p.id} planif={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
