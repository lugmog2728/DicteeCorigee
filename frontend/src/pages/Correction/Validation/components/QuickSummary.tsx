import { CATEGORIES } from '../../constants'
import type { CategoryKey } from '../../constants'

interface Props {
  counts: Record<CategoryKey, number>
}

export default function QuickSummary({ counts }: Props) {
  return (
    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] p-3 flex flex-col gap-3">
      <p className="text-[12px] font-medium text-[#4a5565]">Résumé Rapide</p>
      <div className="grid grid-cols-3 gap-y-2 gap-x-1">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div
              className="size-5 rounded-[4px] flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: cat.color }}
            >
              {cat.letter}
            </div>
            <span className="text-[12px] text-[#364153]">×{counts[cat.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
