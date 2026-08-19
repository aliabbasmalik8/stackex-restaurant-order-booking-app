import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, StateMessage, Text } from '@/components/ui'
import { useUserOrders, type OrderStatus } from '@/core/orders'
import { formatAddress } from '@/core/profile'
import { localized } from '@/utils/localized'
import { money, moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

const TRACK_STEPS = ['pending', 'confirmed', 'preparing', 'ready'] as const

type TrackStep = (typeof TRACK_STEPS)[number]
type StepTone = 'done' | 'current' | 'upcoming'

function statusRank(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 0
    case 'confirmed':
      return 1
    case 'preparing':
      return 2
    case 'ready':
      return 3
    case 'completed':
      return 4
    default:
      return -1
  }
}

function stepTone(status: OrderStatus, step: TrackStep): StepTone {
  const current = statusRank(status)
  const index = TRACK_STEPS.indexOf(step)
  if (current < 0) return 'upcoming'
  if (current >= TRACK_STEPS.length) return 'done'
  if (index < current) return 'done'
  if (index === current) return 'current'
  return 'upcoming'
}

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

function mapsUrl(address: string, lat?: number | null, lng?: number | null) {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function TrackOrderScreen() {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { orders, loading, errorCode, error, refetch } = useUserOrders({
    refetchInterval: 8_000,
  })

  const order = orders.find((row) => row.id === orderId) ?? null
  const goBack = () => navigate('/orders')

  if (loading && !order) {
    return (
      <TrackShell onBack={goBack}>
        <p className="text-[13.5px] font-semibold text-sub">
          {t('common.loading')}
        </p>
      </TrackShell>
    )
  }

  if (errorCode && !order) {
    return (
      <TrackShell onBack={goBack}>
        <StateMessage
          errorCode={errorCode}
          error={error}
          onAction={() => void refetch()}
        />
      </TrackShell>
    )
  }

  if (!order) {
    return (
      <TrackShell onBack={goBack}>
        <Text variant="title">{t('errors.not_found.title')}</Text>
        <Text variant="subtitle" className="mt-2 text-sub">
          {t('errors.not_found.message')}
        </Text>
        <Button
          variant="secondary"
          label={t('orders.backToOrders')}
          onClick={goBack}
          className="mt-4 w-fit"
        />
      </TrackShell>
    )
  }

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
  const cancelled = order.status === 'cancelled'
  const completed = order.status === 'completed'

  return (
    <TrackShell onBack={goBack} code={order.orderCode}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[26px]">
        <section className="flex min-w-0 flex-[1.5] flex-col gap-5">
          <div className="rounded-[22px] bg-card p-6 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.1em] text-sub uppercase">
                  {t('confirmation.pickupCode')}
                </p>
                <p className="mt-1 font-display text-[40px] font-bold tracking-tight text-price">
                  #{order.orderCode}
                </p>
              </div>
              <span className="rounded-pill bg-badge px-2.5 py-1 text-[11px] font-extrabold text-badge-text">
                {t(statusLabelKey(order.status))}
              </span>
            </div>
            {order.readyAround ? (
              <p className="text-[13.5px] font-bold text-sub">
                {t('orders.readyAround', { time: order.readyAround })}
              </p>
            ) : null}

            {cancelled ? (
              <p className="mt-5 rounded-[14px] bg-surface px-4 py-3 text-[13.5px] font-bold text-sub">
                {t('orders.cancelledHint')}
              </p>
            ) : completed ? (
              <p className="mt-5 rounded-[14px] bg-surface px-4 py-3 text-[13.5px] font-bold text-sub">
                {t('orders.completedHint')}
              </p>
            ) : (
              <ol className="mt-6 flex flex-col">
                {TRACK_STEPS.map((step, index) => {
                  const tone = stepTone(order.status, step)
                  const last = index === TRACK_STEPS.length - 1
                  return (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            'grid size-[26px] place-items-center rounded-full text-[11px] font-extrabold',
                            tone === 'done'
                              ? 'bg-check text-check-text'
                              : tone === 'current'
                                ? 'bg-badge text-badge-text'
                                : 'border-[2.5px] border-divider bg-card text-muted',
                          ].join(' ')}
                        >
                          {tone === 'done' ? '✓' : tone === 'current' ? '●' : ''}
                        </span>
                        {last ? null : (
                          <span
                            className={[
                              'h-7 w-[2.5px]',
                              tone === 'done' ? 'bg-check' : 'bg-divider',
                            ].join(' ')}
                          />
                        )}
                      </div>
                      <div className="pt-0.5 pb-4">
                        <p
                          className={[
                            'text-[13.5px] font-extrabold',
                            tone === 'upcoming' ? 'text-muted' : '',
                          ].join(' ')}
                        >
                          {t(statusLabelKey(step))}
                        </p>
                        <p
                          className={[
                            'text-[11.5px] font-semibold',
                            tone === 'current'
                              ? 'text-sub'
                              : 'text-muted',
                          ].join(' ')}
                        >
                          {t(
                            tone === 'done'
                              ? 'orders.stepDone'
                              : tone === 'current'
                                ? 'orders.stepNow'
                                : 'orders.stepNext',
                          )}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          <div className="rounded-[22px] bg-card p-6 shadow-card">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-muted uppercase">
              {t('orders.pickup')}
            </p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14.5px] font-extrabold">{branchLabel}</p>
                <p className="mt-0.5 text-[12.5px] font-semibold leading-snug text-sub">
                  {customerAddress || branchAddress}
                </p>
              </div>
              {branchAddress ? (
                <a
                  href={mapsUrl(branchAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[12.5px] font-extrabold text-link no-underline"
                >
                  {t('confirmation.directions')}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[380px]">
          <div className="flex flex-col rounded-[22px] bg-card p-6 shadow-card">
            <h2 className="font-display text-[16.5px] font-bold tracking-tight">
              {t('checkout.summary')}
            </h2>
            <div className="mt-4 flex flex-col gap-3.5">
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
            <div className="my-4 h-px bg-divider" />
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
          </div>
        </aside>
      </div>
    </TrackShell>
  )
}

function TrackShell({
  onBack,
  code,
  children,
}: {
  onBack: () => void
  code?: number
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <header className="flex shrink-0 items-center gap-4 bg-card px-4 py-4 shadow-[0_1px_0_var(--divider)] sm:px-9">
        <button
          type="button"
          onClick={onBack}
          className="grid size-[38px] place-items-center rounded-full bg-surface text-[17px] text-ink"
          aria-label={t('orders.backToOrders')}
        >
          ‹
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[17px] font-bold tracking-tight">
            {t('orders.trackTitle')}
          </h1>
          {code != null ? (
            <p className="text-[12px] font-bold text-sub">
              {t('payment.orderNumber', { code })}
            </p>
          ) : null}
        </div>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-9 lg:py-[30px]">
        {children}
      </div>
    </div>
  )
}
