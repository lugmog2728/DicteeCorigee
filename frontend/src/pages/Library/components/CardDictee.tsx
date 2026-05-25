import { AlignLeft } from 'lucide-react'
import Badge from '../../../components/Badge'
import type { BadgeVariant } from '../../../components/Badge'

interface DicteeBadge {
  label: string
  variant: BadgeVariant
}

interface CardDicteeProps {
  title: string
  badges: DicteeBadge[]
  wordCount: number
  onPlan?: () => void
  onView?: () => void
}

export default function CardDictee({
  title,
  badges,
  wordCount,
  onPlan,
  onView,
}: CardDicteeProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] flex flex-col w-full overflow-hidden">
      <div className="flex flex-col gap-2 px-6 pt-6">
        <span className="text-base font-medium text-[#0a0a0a] leading-6">{title}</span>
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <Badge key={badge.label} label={badge.label} variant={badge.variant} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-[#6a7282]">
            <AlignLeft size={12} />
            <span>{wordCount} mots</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlan}
            className="flex-1 sm:flex-none h-8 px-4 rounded-lg bg-(--ocean-blue-500) text-white text-sm font-medium cursor-pointer border-0"
          >
            Planifier
          </button>
          <button
            onClick={onView}
            className="flex-1 sm:flex-none h-8 px-4 rounded-lg bg-white border border-black/10 text-[#0a0a0a] text-sm font-medium cursor-pointer"
          >
            Voir
          </button>
        </div>
      </div>
    </div>
  )
}
