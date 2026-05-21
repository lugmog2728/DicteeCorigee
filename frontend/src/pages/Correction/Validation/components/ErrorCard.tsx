import { Check, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, CAT_BY_KEY, getConfidenceStyle } from '../../constants'
import type { ErrorItem, CategoryKey } from '../../constants'

interface Props {
  error: ErrorItem
  onValidate: () => void
  onReject: () => void
  onChangeCategory: (category: CategoryKey) => void
}

export default function ErrorCard({ error, onValidate, onReject, onChangeCategory }: Props) {
  const cat = CAT_BY_KEY[error.category]
  const pct = Math.round(error.confidence * 100)
  const conf = getConfidenceStyle(error.confidence)

  return (
    <div className="border border-[#e5e7eb] rounded-[10px] p-3 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="size-10 rounded-full flex items-center justify-center text-[16px] font-bold text-white shrink-0"
          style={{ backgroundColor: cat.color }}
        >
          {error.letter}
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[#101828]">{cat.label}</span>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 max-w-20 h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: conf.color }}
              />
            </div>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm w-fit"
              style={{ color: conf.color, backgroundColor: conf.bg }}
            >
              {pct}% · {conf.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={error.category}
            onChange={e => onChangeCategory(e.target.value as CategoryKey)}
            className="w-full h-9 bg-[#f3f3f5] rounded-lg pl-3 pr-7 text-[12px] font-medium text-[#0a0a0a] appearance-none outline-none cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.letter} — {c.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={onValidate}
          className="size-10 rounded-lg flex items-center justify-center hover:bg-[#f0fdf4] text-[#16a34a] transition-colors border border-[#e5e7eb] shrink-0"
        >
          <Check size={18} />
        </button>
        <button
          type="button"
          onClick={onReject}
          className="size-10 rounded-lg flex items-center justify-center hover:bg-[#fff1f2] text-[#e11d48] transition-colors border border-[#e5e7eb] shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
