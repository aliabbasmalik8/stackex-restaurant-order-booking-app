import { useBrand } from '@/core/settings'

interface BrandMarkProps {
  size?: number
  letter?: string
  className?: string
  tone?: 'hero' | 'solid'
}

export function BrandMark({
  size = 56,
  letter,
  className = '',
  tone = 'hero',
}: BrandMarkProps) {
  const brand = useBrand()
  const mark = letter ?? brand.monogram
  const radius = Math.round(size * 0.32)

  return (
    <div
      className={[
        'inline-flex items-center justify-center font-display font-bold text-on-hero',
        tone === 'hero' ? 'bg-hero-glass ring-1 ring-hero-glass-border' : 'bg-hero',
        className,
      ].join(' ')}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: Math.round(size * 0.42),
      }}
      aria-hidden
    >
      {mark}
    </div>
  )
}
