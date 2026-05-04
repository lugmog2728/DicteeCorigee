import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'var(--aqua-mist-100)',
  iconColor = 'var(--aqua-mist-700)',
}: StatCardProps) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-sm font-medium text-[#4a5565]">{title}</span>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon size={18} color={iconColor} />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-6 pt-2 pb-6">
        <span className="text-2xl font-semibold text-[#101828] leading-snug">{value}</span>
        <span className="text-xs text-[#6a7282]">{subtitle}</span>
      </div>
    </div>
  )
}
