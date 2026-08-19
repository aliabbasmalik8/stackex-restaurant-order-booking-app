import { useMemo, useRef, useState, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, StateMessage, Text } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { useCart } from '@/context/CartContext'
import { useUserOrders, type Order, type OrderStatus } from '@/core/orders'
import { formatAddress } from '@/core/profile'
import { localized } from '@/utils/localized'
import { money, moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

type Filter = 'current' | 'previous'

function statusLabelKey(
  status: OrderStatus,
):
  | 'orders.status.pending'
  | 'orders.status.confirmed'
  | 'orders.status.preparing'
  | 'orders.status.ready'
  | 'orders.status.completed'
  | 'orders.status.cancelled' {
  switch (status) {
    case 'confirmed':
      return 'orders.status.confirmed'
    case 'preparing':
      return 'orders.status.preparing'
    case 'ready':
      return 'orders.status.ready'
    case 'completed':
      return 'orders.status.completed'
    case 'cancelled':
      return 'orders.status.cancelled'
    default:
      return 'orders.status.pending'
  }
}

function formatOrderDate(iso: string, locale: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function itemSummary(order: Order, locale: string): string {
  const names = order.items.map((line) =>
    localized(locale, line.name, line.name_arabic),
  )
  const head = names.slice(0, 2).join(', ')
  return names.length > 2 ? `${head} +${names.length - 2}` : head
}

function statusProgress(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 22
    case 'confirmed':
      return 42
    case 'preparing':
      return 68
    case 'ready':
      return 92
    case 'completed':
      return 100
    default:
      return 0
  }
}

function ItemThumbs({ order }: { order: Order }) {
  const thumbs = order.items.slice(0, 3)
  if (thumbs.length === 0) {
    return <div className="size-12 shrink-0 rounded-[12px] bg-placeholder" />
  }
  return (
    <div className="flex shrink-0 items-center">
      {thumbs.map((line, index) => (
        <div
          key={line.id}
          className="size-12 overflow-hidden rounded-[12px] border-2 border-card bg-placeholder"
          style={{
            marginInlineStart: index === 0 ? 0 : -12,
            zIndex: thumbs.length - index,
          }}
        >
          {line.image ? (
            <img src={line.image} alt="" className="size-full object-cover" />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function OrdersScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { addItem } = useCart()
  const { currentOrders, pastOrders, loading, errorCode, error, refetch } =
    useUserOrders()
  const [filter, setFilter] = useState<Filter>('current')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailRef = useRef<HTMLElement>(null)

  const list = filter === 'current' ? currentOrders : pastOrders
  const selected =
    list.find((order) => order.id === selectedId) ?? list[0] ?? null

  const emptyTitle =
    filter === 'current'
      ? t('orders.emptyCurrentTitle')
      : t('orders.emptyPreviousTitle')
  const emptyMessage =
    filter === 'current'
      ? t('orders.emptyCurrentMessage')
      : t('orders.emptyPreviousMessage')

  const tabs = useMemo(
    () =>
      [
        {
          id: 'current' as const,
          label: t('orders.filterCurrent'),
          count: currentOrders.length,
        },
        {
          id: 'previous' as const,
          label: t('orders.filterPrevious'),
          count: pastOrders.length,
        },
      ],
    [t, currentOrders.length, pastOrders.length],
  )

  const reorder = (order: Order) => {
    try {
      for (const line of order.items) {
        addItem({
          menuItemId: line.menuItemId,
          name: line.name,
          name_arabic: line.name_arabic,
          image: line.image,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          optionsSummary: line.optionsSummary,
          optionsSummary_arabic: line.optionsSummary_arabic,
          selectedOptionIds: line.selectedOptionIds,
          specialInstructions: line.specialInstructions,
        })
      }
      navigate('/menu')
    } catch {
      navigate('/menu')
    }
  }

  const selectOrder = (id: string) => {
    setSelectedId(id)
    requestAnimationFrame(() => {
      if (window.matchMedia('(min-width: 1024px)').matches) return
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const track = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-9 lg:py-[30px]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <Text as="h1" variant="display">
              {t('orders.title')}
            </Text>
            <p className="mt-1 text-[13.5px] font-semibold text-sub">
              {t('orders.subtitle')}
            </p>
          </div>
          <div className="mt-4 flex w-full rounded-pill bg-surface p-1 sm:mt-0 sm:w-auto sm:min-w-[280px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilter(tab.id)
                  setSelectedId(null)
                }}
                className={[
                  'flex-1 rounded-pill px-4 py-2 text-[13px] font-extrabold sm:flex-none sm:px-5',
                  filter === tab.id
                    ? 'bg-card text-ink shadow-card'
                    : 'text-sub',
                ].join(' ')}
              >
                {tab.label}
                {tab.count > 0 ? ` (${tab.count})` : ''}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex flex-col gap-3">
              <div className="h-[92px] animate-pulse rounded-[20px] bg-card" />
              <div className="h-[92px] animate-pulse rounded-[20px] bg-card" />
              <div className="h-[92px] animate-pulse rounded-[20px] bg-card" />
            </div>
            <div className="hidden h-[360px] animate-pulse rounded-[22px] bg-card lg:block" />
          </div>
        ) : errorCode ? (
          <div className="mt-7 rounded-[22px] bg-card p-8 shadow-card">
            <StateMessage
              errorCode={errorCode}
              error={error}
              onAction={() => void refetch()}
            />
          </div>
        ) : list.length === 0 ? (
          <div className="mt-7 flex min-h-[280px] flex-col items-start justify-center gap-3 rounded-[22px] bg-card px-8 py-12 shadow-card">
            <Text variant="title">{emptyTitle}</Text>
            <Text variant="subtitle" className="max-w-md text-sub">
              {emptyMessage}
            </Text>
            <Button
              variant="secondary"
              label={t('orders.browseMenu')}
              onClick={() => navigate('/menu')}
              className="mt-2 w-fit"
            />
          </div>
        ) : (
          <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[26px]">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {list.map((order) => {
                const active = selected?.id === order.id
                const qty = order.items.reduce(
                  (sum, line) => sum + line.quantity,
                  0,
                )
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => selectOrder(order.id)}
                    className={[
                      'rounded-[20px] border-[1.5px] p-4 text-start shadow-card transition-shadow sm:p-5',
                      active
                        ? 'border-sel bg-card shadow-card-hover'
                        : 'border-transparent bg-card hover:shadow-card-hover',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3.5">
                      <ItemThumbs order={order} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-extrabold">
                              {itemSummary(order, locale) ||
                                t('payment.orderNumber', {
                                  code: order.orderCode,
                                })}
                            </p>
                            <p className="mt-0.5 text-[12.5px] font-bold text-sub">
                              {t('payment.orderNumber', {
                                code: order.orderCode,
                              })}
                              {' · '}
                              {t('common.items', { count: qty })}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-pill bg-badge px-2.5 py-1 text-[11px] font-extrabold text-badge-text">
                            {t(statusLabelKey(order.status))}
                          </span>
                        </div>
                        {filter === 'current' &&
                        order.status !== 'cancelled' ? (
                          <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-surface">
                            <div
                              className="h-full rounded-pill bg-price"
                              style={{
                                width: `${statusProgress(order.status)}%`,
                              }}
                            />
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[12px] font-bold text-muted">
                            {formatOrderDate(order.createdAt, locale)}
                          </span>
                          <span className="font-display text-[15px] font-bold text-price">
                            {moneyFixed(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {selected ? (
              <OrderDetail
                ref={detailRef}
                order={selected}
                showTrack={filter === 'current'}
                onTrack={() => track(selected)}
                onReorder={() => reorder(selected)}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderDetail({
  order,
  showTrack,
  onTrack,
  onReorder,
  ref,
}: {
  order: Order
  showTrack: boolean
  onTrack: () => void
  onReorder: () => void
  ref?: Ref<HTMLElement>
}) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const branchLabel = localized(
    locale,
    order.branchLabel,
    order.branchLabel_arabic,
  )
  const branchAddress = localized(locale, order.address, order.address_arabic)
  const customerAddress = formatAddress(order.customerAddress)
  const paidLabel =
    order.paymentMethod === 'card'
      ? t('confirmation.paidCard')
      : t('confirmation.paidCash')

  return (
    <aside
      ref={ref}
      className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[380px]"
    >
      <div className="flex flex-col rounded-[22px] bg-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.1em] text-sub uppercase">
              {t('orders.details')}
            </p>
            <p className="mt-1 font-display text-[28px] font-bold tracking-tight text-price">
              #{order.orderCode}
            </p>
          </div>
          <span className="rounded-pill bg-badge px-2.5 py-1 text-[11px] font-extrabold text-badge-text">
            {t(statusLabelKey(order.status))}
          </span>
        </div>

        {order.readyAround ? (
          <p className="mt-1 text-[13px] font-bold text-sub">
            {t('orders.readyAround', { time: order.readyAround })}
          </p>
        ) : (
          <p className="mt-1 text-[13px] font-bold text-sub">
            {t('orders.placedOn', {
              date: formatOrderDate(order.createdAt, locale),
            })}
          </p>
        )}

        <div className="mt-5 rounded-[16px] bg-surface p-4">
          <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted uppercase">
            {t('orders.pickup')}
          </p>
          <p className="mt-1 text-[13.5px] font-extrabold">{branchLabel}</p>
          {customerAddress || branchAddress ? (
            <p className="mt-0.5 text-[12.5px] font-semibold leading-snug text-sub">
              {customerAddress || branchAddress}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-3.5">
          <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted uppercase">
            {t('orders.items')}
          </p>
          {order.items.map((line) => (
            <div key={line.id} className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-[10px] bg-placeholder">
                {line.image ? (
                  <img
                    src={line.image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-extrabold">
                  {localized(locale, line.name, line.name_arabic)}
                </p>
                <p className="text-[12px] font-semibold text-sub">
                  {line.quantity}×
                  {line.optionsSummary
                    ? ` · ${localized(
                        locale,
                        line.optionsSummary,
                        line.optionsSummary_arabic,
                      )}`
                    : ''}
                </p>
              </div>
              <span className="shrink-0 font-display text-[13.5px] font-bold text-price">
                {money(line.unitPrice * line.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-divider" />
        <div className="flex justify-between text-[13px] font-semibold text-sub">
          <span>{t('cart.subtotal')}</span>
          <span>{moneyFixed(order.subtotal)}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-[13px] font-semibold text-sub">
          <span>{t('cart.vat')}</span>
          <span>{moneyFixed(order.vat)}</span>
        </div>
        <div className="mt-2 flex justify-between text-[16px] font-extrabold">
          <span>{paidLabel}</span>
          <span className="font-display text-price">
            {moneyFixed(order.total)}
          </span>
        </div>

        <div className="mt-5">
          {showTrack ? (
            <Button
              label={t('orders.trackOrder')}
              onClick={onTrack}
              className="w-full"
            />
          ) : (
            <Button
              variant="secondary"
              label={t('orders.reorder')}
              onClick={onReorder}
              className="w-full"
            />
          )}
        </div>
      </div>
    </aside>
  )
}
