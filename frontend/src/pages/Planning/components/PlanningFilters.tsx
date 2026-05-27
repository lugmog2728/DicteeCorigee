import { Filter, ChevronDown } from 'lucide-react'
import type { Statut } from '../../../api/planifications'

interface PlanningFiltersProps {
  statut:         Statut | 'tous'
  classeId:       number | null
  classesOptions: { id: number; nom: string }[]
  onStatutChange:  (s: Statut | 'tous') => void
  onClasseChange:  (id: number | null) => void
}

export default function PlanningFilters({
  statut,
  classeId,
  classesOptions,
  onStatutChange,
  onClasseChange,
}: PlanningFiltersProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] px-6 py-5">
      <div className="flex items-center gap-3">
        {/* Filtre statut */}
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Filter size={16} className="text-[#0a0a0a]" />
          </div>
          <select
            value={statut}
            onChange={(e) => onStatutChange(e.target.value as Statut | 'tous')}
            className="appearance-none h-9 pl-9 pr-8 rounded-[8px] border border-[#ff9ad6] bg-[#f3f3f5] text-[14px] font-medium text-[#0a0a0a] focus:outline-none cursor-pointer"
          >
            <option value="tous">Tous les statuts</option>
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <ChevronDown size={16} className="text-[#0a0a0a]" />
          </div>
        </div>

        {/* Filtre classe */}
        <div className="relative">
          <select
            value={classeId ?? ''}
            onChange={(e) => onClasseChange(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none h-9 pl-3 pr-8 rounded-[8px] border border-transparent bg-[#f3f3f5] text-[14px] font-medium text-black focus:outline-none cursor-pointer"
          >
            <option value="">Toutes les classes</option>
            {classesOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <ChevronDown size={16} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  )
}
