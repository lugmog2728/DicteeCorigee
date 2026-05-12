import { ReactNode, ElementType } from 'react'

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'xs' | 'subtitle'

const variantStyles: Record<TypographyVariant, string> = {
  h1:       'text-2xl font-semibold leading-9 text-[var(--text-h)] m-0',
  h2:       'text-xl font-medium leading-[30px] text-[var(--text-h)] m-0',
  h3:       'text-lg font-medium leading-[27px] text-[var(--text-h)] m-0',
  h4:       'text-base font-medium leading-6 text-[var(--text-h)] m-0',
  body:     'text-base font-normal leading-6 text-[var(--text-h)] m-0',
  small:    'text-sm font-normal leading-5 text-[var(--text-h)] m-0',
  xs:       'text-xs font-normal leading-4 text-[var(--text-h)] m-0',
  subtitle: 'text-base font-normal leading-6 text-[var(--electric-pink-300)] m-0',
}

const variantTag: Record<TypographyVariant, ElementType> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4',
  body: 'p', small: 'p', xs: 'p', subtitle: 'p',
}

interface TypographyProps {
  variant: TypographyVariant
  children: ReactNode
  className?: string
  as?: ElementType
}

export default function Typography({ variant, children, className = '', as }: TypographyProps) {
  const Tag = as ?? variantTag[variant]
  return (
    <Tag className={`${variantStyles[variant]} ${className}`.trim()}>
      {children}
    </Tag>
  )
}
