import { DineOsMark } from './DineOsMark'

interface BrandMarkProps {
  size?: number
  className?: string
}

/** Rounded DineOS D tile — mirrors the mobile BrandMark. */
export function BrandMark({ size = 56, className = '' }: BrandMarkProps) {
  const glyph = Math.round(size * 0.58)
  const radius = Math.round(size * 0.32)

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center bg-hero-glass ring-1 ring-hero-glass-border ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
      aria-label="DineOS"
    >
      <DineOsMark size={glyph} color="#ffffff" />
    </div>
  )
}
