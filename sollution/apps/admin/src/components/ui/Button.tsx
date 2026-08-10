import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  variant?: Variant
  loading?: boolean
  leftSlot?: ReactNode
  children?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-cta text-on-primary shadow-cta hover:opacity-90 active:opacity-85',
  secondary:
    'bg-surface text-ink border border-border hover:bg-card active:opacity-90',
  ghost: 'bg-transparent text-ink hover:bg-surface active:opacity-90',
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
        'inline-flex h-12 items-center justify-center gap-2 rounded-pill px-6',
        'font-sans text-[15px] font-extrabold transition-opacity',
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
