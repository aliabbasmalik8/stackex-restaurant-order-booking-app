type DineOsWordmarkProps = {
  fontSize?: number
  color?: string
  className?: string
}

/** Full DineOS lockup. Defaults to currentColor. */
export function DineOsWordmark({
  fontSize = 28,
  color = 'currentColor',
  className = '',
}: DineOsWordmarkProps) {
  const oSize = Math.round(fontSize * 0.78)
  const inner = Math.max(3, Math.round(oSize * 0.22))

  return (
    <span
      className={`inline-flex items-center ${className}`.trim()}
      aria-label="DineOS"
      style={{ color }}
    >
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize, color }}
      >
        Dine
      </span>
      <span
        className="inline-flex items-center justify-center"
        style={{ width: oSize, height: fontSize }}
      >
        <svg width={oSize} height={oSize} viewBox="0 0 32 32" aria-hidden>
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle cx="16" cy="16" r={inner} fill="currentColor" />
        </svg>
      </span>
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize, color }}
      >
        S
      </span>
    </span>
  )
}
