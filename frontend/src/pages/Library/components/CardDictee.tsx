import { AlignLeft, Clock } from 'lucide-react'
import Badge from '../../../components/Badge'
import type { BadgeVariant } from '../../../components/Badge'

interface DicteeBadge {
  label: string
  variant: BadgeVariant
}

interface CardDicteeProps {
  title: string
  description: string
  badges: DicteeBadge[]
  wordCount: number
  duration: number
  onPlan?: () => void
  onView?: () => void
}

export default function CardDictee({
  title,
  description,
  badges,
  wordCount,
  duration,
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
        <p className="text-sm text-[#4a5565] leading-5 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-[#6a7282]">
            <AlignLeft size={12} />
            <span>{wordCount} mots</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#6a7282]">
            <Clock size={12} />
            <span>{duration} min</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlan}
            className="h-8 px-4 rounded-lg bg-(--ocean-blue-500) text-white text-sm font-medium cursor-pointer border-0"
          >
            Planifier
          </button>
          <button
            onClick={onView}
            className="h-8 px-4 rounded-lg bg-white border border-black/10 text-[#0a0a0a] text-sm font-medium cursor-pointer"
          >
            Voir
          </button>
        </div>
      </div>
    </div>
  )
}
