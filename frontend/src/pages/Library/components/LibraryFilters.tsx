import { Search, ListFilter, ChevronDown } from 'lucide-react'

interface LibraryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  level: string
  onLevelChange: (value: string) => void
  period: string
  onPeriodChange: (value: string) => void
}

const levels = ['Tous niveaux', 'CP', 'CE1', 'CE2', 'CM1', 'CM2']
const periods = ['Toutes périodes', 'Présent', 'Passé', 'Futur', 'Imparfait']

export default function LibraryFilters({
  search,
  onSearchChange,
  level,
  onLevelChange,
  period,
  onPeriodChange,
}: LibraryFiltersProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] p-4 flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717182]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par titre ou catégorie..."
          className="w-full h-9 bg-[#f3f3f5] rounded-lg pl-9 pr-3 text-sm text-[#0a0a0a] placeholder:text-[#717182] outline-none border border-transparent focus:border-[var(--ocean-blue-500)]"
        />
      </div>

      <div className="relative">
        <ListFilter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0a0a0a]" />
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value)}
          className="h-9 bg-[#f3f3f5] rounded-lg pl-8 pr-7 text-sm font-medium text-[#0a0a0a] border border-[var(--ocean-blue-500)] appearance-none outline-none cursor-pointer"
        >
          {levels.map((l) => <option key={l}>{l}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0a0a0a] pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="h-9 bg-[#f3f3f5] rounded-lg pl-3 pr-7 text-sm font-medium text-[#0a0a0a] border border-transparent appearance-none outline-none cursor-pointer"
        >
          {periods.map((p) => <option key={p}>{p}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0a0a0a] pointer-events-none" />
      </div>
    </div>
  )
}
