import { CATEGORIES, getPerformance } from '../../constants'
import type { CategoryKey } from '../../constants'
import type { DicteeApi } from '../../../../api/dictees'

interface Props {
  counts: Record<CategoryKey, number>
  dictee: DicteeApi
}

export default function CategorySummary({ counts, dictee }: Props) {
  return (
    <div className="flex-1 min-w-0 w-full bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-5 flex flex-col gap-3 md:max-h-80 md:overflow-y-auto">
      <p className="text-[14px] font-semibold text-[#101828] shrink-0">Résumé par Catégorie</p>
      <div className="flex flex-col gap-2">
        {CATEGORIES.map(cat => {
          const count = counts[cat.key] ?? 0
          const isNeutralized = cat.key !== 'orthographe' && (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0) === 0
          const perf = getPerformance(count)
          return (
            <div
              key={cat.key}
              className="flex items-center gap-3 rounded-[8px] px-3 py-2"
              style={{
                backgroundColor: isNeutralized ? '#f9fafb' : count === 0 ? '#f0fdf4' : perf.bg,
                opacity: isNeutralized ? 0.55 : 1,
              }}
            >
              <div
                className="size-7 rounded-[6px] flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                {cat.letter}
              </div>
              <span className="text-[12px] font-medium text-[#101828] flex-1">{cat.label}</span>
              {isNeutralized ? (
                <span className="text-[11px] text-[#9ca3af] italic">Neutralisé</span>
              ) : (
                <span className="text-[12px] font-semibold" style={{ color: perf.color }}>
                  {count} erreur{count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
