import type { HTMLAttributes, ReactNode } from 'react'

type Variant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'link'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'label'
  variant?: Variant
  children: ReactNode
  htmlFor?: string
}

const variantClass: Record<Variant, string> = {
  display: 'font-display text-[28px] font-bold tracking-tight text-ink',
  title: 'font-display text-[26px] font-bold tracking-tight text-ink',
  subtitle: 'font-sans text-sm font-semibold leading-snug text-ink',
  body: 'font-sans text-sm font-normal text-ink',
  bodyStrong: 'font-sans text-[15px] font-bold text-ink',
  caption: 'font-sans text-xs font-bold text-ink',
  label:
    'font-sans text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted',
  link: 'font-sans text-[13.5px] font-bold text-link',
}

export function Text({
  as: Tag = 'p',
  variant = 'body',
  className = '',
  children,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={[variantClass[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
