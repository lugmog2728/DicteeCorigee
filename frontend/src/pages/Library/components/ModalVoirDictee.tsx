import { X, AlignLeft } from 'lucide-react'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import type { BadgeVariant } from '../../../components/Badge'
import type { ErrorCounts } from '../../../api/dictees'

interface DicteeBadge {
  label: string
  variant: BadgeVariant
}

interface ModalVoirDicteeProps {
  title: string
  texte: string
  wordCount: number
  badges: DicteeBadge[]
  errors: ErrorCounts
  onClose: () => void
  onPlan?: () => void
  onEdit?: () => void
}

const errorCategories: { key: keyof ErrorCounts; letter: string; label: string; border: string }[] = [
  { key: 'conjugaison', letter: 'C', label: 'Conjugaison',  border: 'var(--ocean-blue-500)' },
  { key: 'homophone',   letter: 'H', label: 'Homophone',    border: 'var(--ocean-blue-200)' },
  { key: 'accord',      letter: 'A', label: 'Accord',       border: 'var(--electric-pink-500)' },
  { key: 'majuscule',   letter: 'M', label: 'Majuscule',    border: 'var(--soft-blush-800)' },
  { key: 'ponctuation', letter: 'P', label: 'Ponctuation',  border: 'var(--sunlight-sand-700)' },
  { key: 'infinitif',   letter: 'I', label: 'Infinitif',    border: 'var(--ocean-blue-500)' },
  { key: 'orthographe', letter: 'O', label: 'Orthographe',  border: 'var(--electric-pink-700)' },
  { key: 'nonPresent',  letter: 'N', label: 'Non présent',  border: 'var(--aqua-mist-600)' },
  { key: 'son',         letter: 'S', label: 'Son',          border: 'var(--soft-blush-900)' },
]

export default function ModalVoirDictee({
  title, texte, wordCount, badges, errors, onClose, onPlan, onEdit,
}: ModalVoirDicteeProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white border border-[rgba(0,0,0,0.1)] rounded-t-[20px] sm:rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-full sm:w-[495px] max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <h2 className="text-[18px] font-semibold text-[#0a0a0a] leading-[18px]">{title}</h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity mt-0.5">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-2.5">

          {/* Badges : niveau, période, temps, tag */}
          <div className="flex flex-wrap gap-1.5">
            {badges.map(b => (
              <Badge key={b.label} label={b.label} variant={b.variant} />
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[14px] text-[#4a5565]">
              <AlignLeft size={16} />
              <span>{wordCount} mots</span>
            </div>
          </div>

          {/* Texte de la dictée */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#364153] leading-[20px]">Texte de la dictée</p>
            <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] px-[16.8px] pt-[16.8px] pb-2">
              <p className="text-[14px] leading-[22.75px] text-[#101828]">{texte}</p>
            </div>
          </div>

          {/* Erreurs */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#364153] leading-[20px]">Nombre d'erreurs</p>
            <div className="bg-[#f9fafb] border border-[#d1d5dc] rounded-[8px] p-4 grid grid-cols-3 gap-2.5">
              {errorCategories.map(cat => (
                <div
                  key={cat.key}
                  className="bg-white rounded-[10px] flex items-center justify-between p-[13.6px] h-[71px]"
                  style={{ border: `1.6px solid ${cat.border}` }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[18px] font-bold text-[#364153] leading-[28px]">{cat.letter}</span>
                    <span className="text-[12px] text-[#4a5565] leading-[16px]">{cat.label}</span>
                  </div>
                  <div className="border border-[#d1d5dc] rounded-[8px] w-[62px] h-[33px] flex items-center justify-center">
                    <span className="text-[16px] text-[rgba(10,10,10,0.7)] font-medium">{errors[cat.key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[rgba(0,0,0,0.1)] pt-4 flex items-center justify-between">
            {onEdit && (
              <Button label="Éditer" variant="outline" onClick={onEdit} />
            )}
            <div className="ml-auto">
              <Button label="Planifier cette Dictée" variant="primary" onClick={onPlan} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
