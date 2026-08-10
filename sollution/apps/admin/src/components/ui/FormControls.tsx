import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Text } from '@/components/ui/Text'

const controlClass =
  'w-full rounded-lg border border-border bg-card px-[18px] text-[15px] text-ink placeholder:text-muted shadow-card outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 font-semibold'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string | null
  options: { value: string; label: string }[]
}

export function SelectField({
  label,
  error,
  id,
  options,
  className = '',
  ...rest
}: SelectFieldProps) {
  const fieldId = id ?? rest.name
  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <Text as="span" variant="label" className="ps-1.5">
        {label}
      </Text>
      <select
        id={fieldId}
        className={['h-14', controlClass, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <Text as="span" variant="caption" className="ps-1.5 text-error">
          {error}
        </Text>
      ) : null}
    </label>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string | null
}

export function TextAreaField({
  label,
  error,
  id,
  className = '',
  rows = 3,
  ...rest
}: TextAreaFieldProps) {
  const fieldId = id ?? rest.name
  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <Text as="span" variant="label" className="ps-1.5">
        {label}
      </Text>
      <textarea
        id={fieldId}
        rows={rows}
        className={['py-3', controlClass, className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error ? (
        <Text as="span" variant="caption" className="ps-1.5 text-error">
          {error}
        </Text>
      ) : null}
    </label>
  )
}

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function CheckboxField({ label, className = '', ...rest }: CheckboxFieldProps) {
  return (
    <label className={['inline-flex items-center gap-2 text-sm font-bold text-ink', className].join(' ')}>
      <input
        type="checkbox"
        className="size-4 rounded border-border accent-[var(--cta-bg)]"
        {...rest}
      />
      {label}
    </label>
  )
}
