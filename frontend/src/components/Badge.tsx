export type BadgeVariant = 'default' | 'pink' | 'aqua' | 'sand' | 'blush' | 'ocean' | 'purple'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#f1f3f5] text-[#364153] ring-2 ring-[#364153]',
  pink:    'bg-[var(--electric-pink-100)] text-[var(--electric-pink-700)] ring-1 ring-[var(--electric-pink-700)]',
  aqua:    'bg-[var(--aqua-mist-100)] text-[var(--aqua-mist-700)] ring-1 ring-[var(--aqua-mist-700)]',
  sand:    'bg-[var(--sunlight-sand-100)] text-[var(--sunlight-sand-900)] ring-1 ring-[var(--sunlight-sand-900)]',
  blush:   'bg-[var(--soft-blush-500)] text-[var(--sunlight-sand-900)] ring-1 ring-[var(--sunlight-sand-900)]',
  ocean:   'bg-[var(--ocean-blue-100)] text-[var(--ocean-blue-700)] ring-1 ring-[var(--ocean-blue-700)]',
  purple:  'bg-[#faf5ff] text-[#8200db] ring-1 ring-[#8200db]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export default function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-lg font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {label}
    </span>
  )
}
