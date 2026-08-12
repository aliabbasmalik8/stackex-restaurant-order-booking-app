import type { InputHTMLAttributes, ReactNode } from 'react'
import { Text } from '@/components/ui'
import type { SettingItemDto } from '@/api/OrderBooking/modules/settings'

export function StatusBadge({
  item,
  dirty,
  labels,
}: {
  item?: SettingItemDto
  dirty: boolean
  labels: { override: string; default: string; changed: string }
}) {
  if (!item) return null
  const text = dirty
    ? labels.changed
    : item.isOverride
      ? labels.override
      : labels.default
  const tone = dirty
    ? 'bg-cta/15 text-ink'
    : item.isOverride
      ? 'bg-badge text-badge-text'
      : 'bg-surface text-muted ring-1 ring-border'
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${tone}`}
    >
      {text}
    </span>
  )
}

export function SettingField({
  label,
  badge,
  hint,
  className = '',
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  badge?: ReactNode
  hint?: string
}) {
  const fieldId = inputProps.id ?? inputProps.name
  return (
    <label className={`flex flex-col gap-1.5 ${className}`} htmlFor={fieldId}>
      <span className="flex items-center justify-between gap-2 ps-1.5">
        <Text as="span" variant="label" className="m-0">
          {label}
        </Text>
        {badge}
      </span>
      <input
        id={fieldId}
        className={[
          'h-14 rounded-lg border border-border bg-card px-[18px] text-[15px] text-ink',
          'placeholder:text-muted outline-none',
          'focus:border-cta focus:ring-2 focus:ring-cta/20',
          'font-semibold',
        ].join(' ')}
        {...inputProps}
      />
      {hint ? (
        <Text as="span" variant="caption" className="ps-1.5 text-muted">
          {hint}
        </Text>
      ) : null}
    </label>
  )
}

export function ReadOnlyRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <Text as="span" variant="label" className="m-0 text-muted">
        {label}
      </Text>
      <Text as="p" variant="bodyStrong" className="m-0 mt-1 break-words">
        {value || '—'}
      </Text>
    </div>
  )
}
