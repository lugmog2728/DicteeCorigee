import { Users, TrendingUp, CalendarDays } from 'lucide-react'

type ColorVariant = 'aqua' | 'sand' | 'blush' | 'pink'

interface CardClasseProps {
  nom:              string
  niveau:           string
  annee:            string
  nbEleves:         number
  moyenne?:         number | null
  derniereActivite?: string | null
  colorVariant?:    ColorVariant
  onClick?:         () => void
}

const iconBg: Record<ColorVariant, string> = {
  aqua:  'bg-[rgba(0,145,173,0.1)] text-[#0091ad]',
  sand:  'bg-[#fff6e9] text-[#d5bc4c]',
  blush: 'bg-[#fff4e4] text-[#ffca7e]',
  pink:  'bg-[#ffddf1] text-[#ab347b]',
}

export default function CardClasse({
  nom,
  niveau,
  annee,
  nbEleves,
  moyenne,
  derniereActivite,
  colorVariant = 'aqua',
  onClick,
}: CardClasseProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#e5e7eb] rounded-[14px] flex flex-col gap-6 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-medium text-[#0a0a0a] leading-7">{nom}</span>
          <span className="text-[14px] font-normal text-[#6a7282] leading-5">{niveau} · {annee}</span>
        </div>
        <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${iconBg[colorVariant]}`}>
          <Users size={20} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-4 px-6 pb-6">
        <div className="flex gap-8">
          {/* Élèves */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#6a7282]">
              <Users size={12} />
              <span className="text-[12px]">Élèves</span>
            </div>
            <span className="text-[20px] font-semibold text-[#101828] leading-7">{nbEleves}</span>
          </div>

          {/* Moyenne */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#6a7282]">
              <TrendingUp size={12} />
              <span className="text-[12px]">Moyenne</span>
            </div>
            <span className="text-[20px] font-semibold text-[#101828] leading-7">
              {moyenne != null ? `${moyenne}%` : '—'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f3f4f6] pt-4 flex items-center gap-2 text-[#6a7282]">
          <CalendarDays size={12} />
          <span className="text-[12px]">
            {derniereActivite ?? 'Aucune activité récente'}
          </span>
        </div>
      </div>
    </div>
  )
}
