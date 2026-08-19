import type {
  OrderCustomerAddress,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/modules/orders'

export function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCustomerAddress(
  address: OrderCustomerAddress | null | undefined,
): string {
  if (!address) return ''
  const parts = [
    address.line1?.trim(),
    address.line2?.trim(),
    address.area?.trim(),
    address.city?.trim(),
  ].filter(Boolean)
  return parts.join(', ')
}

export function formatWhen(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export const statusTone: Record<OrderStatus, string> = {
  draft: 'bg-surface text-muted',
  pending: 'bg-surface text-sub',
  confirmed: 'bg-[#152238]/10 text-ink',
  preparing: 'bg-badge/20 text-ink',
  ready: 'bg-cta/18 text-ink',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-error/10 text-error',
}

export const paymentStatusTone: Record<PaymentStatus, string> = {
  not_required: 'bg-surface text-muted',
  unpaid: 'bg-badge/25 text-ink',
  paid: 'bg-cta/18 text-ink',
  failed: 'bg-error/10 text-error',
  cancelled: 'bg-error/10 text-error',
}

export const paymentMethodTone: Record<PaymentMethod, string> = {
  cash: 'bg-surface text-sub',
  card: 'bg-[#152238]/10 text-ink',
}
