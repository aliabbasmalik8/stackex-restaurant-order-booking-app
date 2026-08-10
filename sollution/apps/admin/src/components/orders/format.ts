import type { OrderStatus } from '@/modules/orders'

export function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatWhen(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export const statusTone: Record<OrderStatus, string> = {
  pending: 'bg-surface text-sub',
  confirmed: 'bg-sel/10 text-ink',
  preparing: 'bg-badge/15 text-ink',
  ready: 'bg-cta/15 text-ink',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-error/10 text-error',
}
