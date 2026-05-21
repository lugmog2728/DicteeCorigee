import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'

interface ButtonProps {
  label: string
  variant?: ButtonVariant
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:     'bg-[var(--ocean-blue-500)] text-white hover:bg-[var(--ocean-blue-600)]',
  outline:     'bg-white border border-[rgba(0,0,0,0.1)] text-[#0a0a0a] hover:bg-gray-50',
  secondary:   'bg-[#f0feff] text-[#030213] hover:bg-[var(--aqua-mist-100)]',
  ghost:       'text-[#0a0a0a] hover:bg-gray-100',
  destructive: 'bg-[#d4183d] text-white hover:bg-[#b01232]',
  link:        'text-[var(--ocean-blue-500)] hover:underline px-0',
}

export default function Button({
  label,
  variant = 'primary',
  icon,
  onClick,
  disabled,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-[7px] h-[36px] rounded-[8px] px-4 text-[14px] font-medium leading-[20px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className ?? ''}`}
    >
      {icon && <span className="size-4 shrink-0 flex items-center justify-center">{icon}</span>}
      {label}
    </button>
  )
}
