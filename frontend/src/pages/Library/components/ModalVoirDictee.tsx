import { X, AlignLeft, Clock } from 'lucide-react'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import type { BadgeVariant } from '../../../components/Badge'

interface DicteeBadge {
  label: string
  variant: BadgeVariant
}

interface ModalVoirDicteeProps {
  title: string
  description: string
  texte: string
  wordCount: number
  duration: number
  badges: DicteeBadge[]
  onClose: () => void
  onPlan?: () => void
}

export default function ModalVoirDictee({
  title,
  description,
  texte,
  wordCount,
  duration,
  badges,
  onClose,
  onPlan,
}: ModalVoirDicteeProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-[495px] max-h-[90vh] overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <h2 className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">{title}</h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity mt-0.5">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-2.5">

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {badges.map(b => (
              <Badge key={b.label} label={b.label} variant={b.variant} />
            ))}
          </div>

          {/* Meta : mots + durée */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[14px] text-[#4a5565]">
              <AlignLeft size={16} />
              <span>{wordCount} mots</span>
            </div>
            <div className="flex items-center gap-1 text-[14px] text-[#4a5565]">
              <Clock size={16} />
              <span>{duration} minutes</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#eff6ff] border border-[#bedbff] rounded-[10px] px-[12.8px] pt-[12.8px] pb-2">
            <p className="text-[14px] leading-[20px] text-[#1c398e]">
              <strong>Description :</strong>{' '}
              <span className="font-normal">{description}</span>
            </p>
          </div>

          {/* Texte de la dictée */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#364153] leading-[20px]">Texte de la dictée</p>
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] px-[16.8px] pt-[16.8px] pb-2">
              <p className="text-[14px] leading-[22.75px] text-[#101828]">{texte}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[rgba(0,0,0,0.1)] pt-4 flex justify-end">
            <Button label="Planifier cette Dictée" variant="primary" onClick={onPlan} />
          </div>

        </div>
      </div>
    </div>
  )
}
