import type { InputHTMLAttributes } from 'react'
import { Text } from '@/components/ui/Text'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
}

export function Field({
  label,
  error,
  id,
  className = '',
  ...inputProps
}: FieldProps) {
  const fieldId = id ?? inputProps.name

  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <Text as="span" variant="label" className="ps-1.5">
        {label}
      </Text>
      <input
        id={fieldId}
        className={[
          'h-14 rounded-lg border border-border bg-card px-[18px] text-[15px] text-ink',
          'placeholder:text-muted shadow-card outline-none',
          'focus:border-cta focus:ring-2 focus:ring-cta/20',
          'font-semibold',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...inputProps}
      />
      {error ? (
        <Text as="span" variant="caption" className="ps-1.5 text-error">
          {error}
        </Text>
      ) : null}
    </label>
  )
}
