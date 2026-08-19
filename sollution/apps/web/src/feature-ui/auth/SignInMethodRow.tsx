type SignInMethodRowProps = {
  label: string
  hint?: string | null
  actionLabel: string
  onPress?: () => void
  disabled?: boolean
  last?: boolean
}

export function SignInMethodRow({
  label,
  hint,
  actionLabel,
  onPress,
  disabled,
  last,
}: SignInMethodRowProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      className={[
        'flex w-full items-center gap-3 px-[17px] py-4 text-start',
        last ? '' : 'border-b border-divider',
        disabled || !onPress ? 'cursor-default opacity-70' : 'hover:bg-surface',
      ].join(' ')}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[12px] font-semibold text-muted">
            {hint}
          </span>
        ) : null}
      </span>
      <span
        className={[
          'shrink-0 text-[12.5px] font-extrabold',
          disabled || !onPress ? 'text-muted' : 'text-link',
        ].join(' ')}
      >
        {actionLabel}
      </span>
    </button>
  )
}
