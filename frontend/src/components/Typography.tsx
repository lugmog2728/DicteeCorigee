import { ReactNode, ElementType } from 'react'

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'xs' | 'subtitle'

interface TypographyProps {
  variant: TypographyVariant
  children: ReactNode
  className?: string
  as?: ElementType
}

const variantMap: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  small: 'p',
  xs: 'p',
  subtitle: 'p',
}

export default function Typography({ variant, children, className = '', as }: TypographyProps) {
  const Tag = as ?? variantMap[variant]
  return (
    <Tag className={`typography-${variant} ${className}`.trim()}>
      {children}
    </Tag>
  )
}
