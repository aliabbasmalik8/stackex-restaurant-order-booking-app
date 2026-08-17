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
          'h-[58px] rounded-[16px] border-[1.5px] border-border bg-card px-[18px] text-[15px] font-bold text-ink',
          'placeholder:text-muted placeholder:font-semibold outline-none',
          'focus:border-cta focus:ring-2 focus:ring-cta/15',
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
