import { Printer, Download } from 'lucide-react'
import { CATEGORIES, getPerformance } from '../../constants'
import type { CategoryKey } from '../../constants'
import type { DicteeApi } from '../../../../api/dictees'
import Speedometer from './Speedometer'

interface Props {
  counts: Record<CategoryKey, number>
  dictee: DicteeApi
  onPrint: () => void
  onSavePdf: () => void
}

export default function DetailedScoreGrid({ counts, dictee, onPrint, onSavePdf }: Props) {
  const wordCount = dictee.texte.split(/\s+/).filter(Boolean).length

  return (
    <div id="score-grid" className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <p className="text-[16px] font-semibold text-[#101828]">Score Détaillé par Type d'Erreur</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSavePdf}
            className="flex items-center gap-1.5 text-[13px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors"
          >
            <Download size={15} />
            Enregistrer PDF
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 text-[13px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors"
          >
            <Printer size={15} />
            Imprimer
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.filter(cat => cat.key !== 'nonPresent' && cat.key !== 'son').map(cat => {
          const count = counts[cat.key] ?? 0
          const isNeutralized = cat.key !== 'orthographe' && (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0) === 0
          const perf = getPerformance(count)
          const expected = cat.key === 'orthographe' ? wordCount : (dictee.errors[cat.key as keyof typeof dictee.errors] ?? 0)
          const done = Math.max(0, expected - count)

          return (
            <div
              key={cat.key}
              className="border border-[#e5e7eb] rounded-[12px] p-4 flex flex-col gap-2"
              style={{ opacity: isNeutralized ? 0.5 : 1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-[10px] flex items-center justify-center text-[20px] font-bold text-white shrink-0"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.letter}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-[#101828] leading-tight">{cat.label}</span>
                  <span className="text-[12px] text-[#6a7282]">
                    {isNeutralized ? '⊘ Neutralisé' : `${count} erreur${count !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
              <Speedometer done={done} total={expected} neutralized={isNeutralized} />
              {!isNeutralized && (
                <span
                  className="self-end text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ color: perf.color, backgroundColor: perf.bg }}
                >
                  {perf.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
