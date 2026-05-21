import { Medal } from 'lucide-react'
import DonutChart from './DonutChart'
import { CATEGORIES } from '../../constants'

interface Props {
  score: number
  totalErrors: number
  typesEvaluated: number
  neutralizedCount: number
  overallPerf: { label: string; emoji: string }
}

export default function ScoreGlobal({ score, totalErrors, typesEvaluated, neutralizedCount, overallPerf }: Props) {
  return (
    <div className="flex-[2] min-w-0 bg-white border-2 border-[var(--ocean-blue-500,#0091ad)] rounded-[14px] p-6 flex flex-col gap-5">
      <p className="text-[16px] font-semibold text-[#101828]">Score Global</p>

      <div className="flex items-center gap-8">
        <div className="relative shrink-0">
          <DonutChart score={score} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[18px] font-bold text-[#101828]">{score}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="text-[36px] font-bold text-[#101828] leading-none">
            {score} <span className="text-[20px] text-[#6a7282] font-normal">/ 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[13px] text-[#4a5565]">
              Total d'erreurs : <strong className="text-[#101828]">{totalErrors}</strong>
            </p>
            <p className="text-[13px] text-[#4a5565]">
              Types évalués : <strong className="text-[#101828]">{typesEvaluated} / {CATEGORIES.length}</strong>
            </p>
            {neutralizedCount > 0 && (
              <p className="text-[13px] text-[#6a7282]">{neutralizedCount} type(s) neutralisé(s)</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#e5e7eb]" />

      <div className="flex items-center gap-2">
        <Medal size={18} className="text-[#d97706]" />
        <span className="text-[14px] text-[#4a5565]">Niveau de Performance</span>
        <span className="text-[14px] font-semibold text-[#101828]">/ {overallPerf.label}</span>
        <span className="text-[16px]">{overallPerf.emoji}</span>
      </div>
    </div>
  )
}
