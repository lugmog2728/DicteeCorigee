import { Info, ArrowRight } from 'lucide-react'
import Button from '../../../../components/Button'
import { CATEGORIES } from '../../constants'
import type { CategoryKey } from '../../constants'

interface Props {
  counts: Record<CategoryKey, number>
  totalErrors: number
  score: number
  avgConfidence: number
  onNext: () => void
}

export default function DetectionSummary({ counts, totalErrors, score, avgConfidence, onNext }: Props) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-6">
      <p className="text-[16px] font-medium text-[#0a0a0a]">Résumé de la Détection d'Erreurs</p>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(cat => {
          const count = counts[cat.key]
          const hasErrors = count > 0
          return (
            <div
              key={cat.key}
              className="rounded-[10px] p-3 flex flex-col gap-1"
              style={{
                border: `1.6px solid ${hasErrors ? cat.color : '#e5e7eb'}`,
                backgroundColor: hasErrors ? cat.bg : 'white',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#4a5565]">{cat.letter}</span>
                <span className="text-[20px] font-bold text-[#101828]">{count}</span>
              </div>
              <p className="text-[12px] text-[#6a7282]">{cat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#eff6ff] border border-[#bedbff] rounded-[10px] p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#193cb8] shrink-0" />
          <span className="text-[14px] font-medium text-[#193cb8]">Résumé de la Détection</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-[#1447e6]">
            {"Total d'erreurs détectées : "}<strong>{totalErrors}</strong>
          </p>
          <p className="text-[14px] text-[#1447e6]">
            {"Note estimée : "}<strong>{score}%</strong>
          </p>
          <p className="text-[12px] text-[#1447e6]">
            Confiance moyenne : {avgConfidence}%
          </p>
        </div>
      </div>

      <Button
        label="Passer à la Validation"
        variant="primary"
        icon={<ArrowRight size={16} />}
        className="w-full justify-center"
        onClick={onNext}
      />
    </div>
  )
}
