export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex h-[52px] items-center gap-3.5 rounded-pill border-[1.5px] border-border px-4">
      <button
        type="button"
        className="text-[15px] font-extrabold text-sub disabled:opacity-30"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-4 text-center text-[14.5px] font-extrabold">
        {value}
      </span>
      <button
        type="button"
        className="text-[15px] font-extrabold text-link disabled:opacity-30"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
