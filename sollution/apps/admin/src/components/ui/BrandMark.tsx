import { brand } from '@/theme'

interface BrandMarkProps {
  size?: number
  letter?: string
  className?: string
}

/** Rounded monogram tile — mirrors the mobile BrandMark. */
export function BrandMark({
  size = 56,
  letter = brand.monogram,
  className = '',
}: BrandMarkProps) {
  const radius = Math.round(size * 0.32)

  return (
    <div
      className={`inline-flex items-center justify-center bg-hero-glass ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
      aria-hidden
    >
      <span
        className="font-display font-bold text-on-hero"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {letter}
      </span>
    </div>
  )
}
