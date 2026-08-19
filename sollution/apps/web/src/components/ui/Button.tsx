import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'social' | 'socialLight' | 'hero'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  variant?: Variant
  loading?: boolean
  leftSlot?: ReactNode
  children?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-cta text-on-primary shadow-cta hover:brightness-105 active:brightness-95',
  secondary:
    'bg-card text-ink border border-border shadow-sm hover:bg-surface active:bg-surface',
  ghost: 'bg-transparent text-ink hover:bg-surface active:opacity-90',
  social:
    'bg-hero-glass text-on-hero ring-1 ring-hero-glass-border hover:bg-white/20',
  socialLight:
    'bg-card text-ink border-[1.5px] border-border hover:bg-surface',
  hero: 'bg-white text-hero hover:brightness-105',
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  leftSlot,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex h-[52px] items-center justify-center gap-2 rounded-pill px-6',
        'font-sans text-[14.5px] font-extrabold transition-opacity',
        'disabled:cursor-not-allowed disabled:opacity-55',
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="size-4 animate-pulse rounded-full bg-current opacity-70" />
      ) : (
        <>
          {leftSlot}
          {children ?? label}
        </>
      )}
    </button>
  )
}
