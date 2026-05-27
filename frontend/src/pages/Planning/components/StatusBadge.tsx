import { Clock, Play, CheckCircle } from 'lucide-react'
import type { Statut } from '../../../api/planifications'

interface StatusBadgeProps {
  statut: Statut
}

const CONFIG = {
  planifiee: {
    label: 'Planifiée',
    bg: 'bg-[#f3f4f6]',
    border: 'border-[#e5e7eb]',
    text: 'text-[#1e2939]',
    Icon: Clock,
  },
  en_cours: {
    label: 'En cours',
    bg: 'bg-[#dbeafe]',
    border: 'border-[#bedbff]',
    text: 'text-[#193cb8]',
    Icon: Play,
  },
  terminee: {
    label: 'Terminée',
    bg: 'bg-[#dcfce7]',
    border: 'border-[#b9f8cf]',
    text: 'text-[#016630]',
    Icon: CheckCircle,
  },
}

export default function StatusBadge({ statut }: StatusBadgeProps) {
  const { label, bg, border, text, Icon } = CONFIG[statut]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[8px] border text-[12px] font-medium whitespace-nowrap ${bg} ${border} ${text}`}
    >
      <Icon size={12} />
      {label}
    </span>
  )
}
