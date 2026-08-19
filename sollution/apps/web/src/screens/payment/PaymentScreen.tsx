import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import type { Order } from '@/core/orders'
import {
  hasStripePublishableKey,
  usePlatformCardPayment,
} from '@/features/stripe-payment'
import { localized } from '@/utils/localized'
import { money, moneyFixed } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

export function PaymentScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pendingPaymentOrder } = useCart()
  const leavingForSuccess = useRef(false)

  useEffect(() => {
    if (pendingPaymentOrder || leavingForSuccess.current) return
    navigate('/checkout', { replace: true })
  }, [pendingPaymentOrder, navigate])

  if (!pendingPaymentOrder) return null

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <header className="flex shrink-0 items-center gap-4 bg-card px-4 py-4 shadow-[0_1px_0_var(--divider)] sm:px-9">
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="grid size-[38px] place-items-center rounded-full bg-surface text-[17px] text-ink"
          aria-label={t('common.back')}
        >
          ‹
        </button>
        <h1 className="font-display text-[17px] font-bold tracking-tight">
          {t('payment.title')}
        </h1>
      </header>
      {hasStripePublishableKey() ? (
        <PaymentScreenInner
          order={pendingPaymentOrder}
          onBack={() => navigate('/checkout')}
          onPaid={() => {
            leavingForSuccess.current = true
            navigate('/order-success', { replace: true })
          }}
        />
      ) : (
        <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-9">
          <FormError message={t('payment.missingPublishableKey')} />
          <Button
            variant="secondary"
            label={t('common.back')}
            onClick={() => navigate('/checkout')}
            className="mt-4 w-fit"
          />
        </div>
      )}
    </div>
  )
}

function PaymentScreenInner({
  order,
  onBack,
  onPaid,
}: {
  order: Order
  onBack: () => void
  onPaid: () => void
}) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const { confirmPendingPaymentPaid } = useCart()
  const payment = usePlatformCardPayment(order.id)
  const Form = payment.Form

  const onPayPress = useCallback(async () => {
    const result = await payment.pay()
    if (result !== 'paid') return
    confirmPendingPaymentPaid()
    onPaid()
  }, [confirmPendingPaymentPaid, onPaid, payment])

  const payDisabled = !payment.ready || payment.loading || payment.paying

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1120px] flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-9 lg:flex-row lg:items-stretch lg:gap-[26px] lg:py-[30px]">
      <section className="flex min-w-0 flex-[1.5] flex-col rounded-[22px] bg-card p-6 shadow-card">
        <h2 className="font-display text-[16.5px] font-bold tracking-tight">
          {t('payment.cardDetails')}
        </h2>
        <p className="mt-1.5 text-[13.5px] font-semibold leading-snug text-sub">
          {t('payment.subtitle')}
        </p>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          {Form ? <Form /> : null}
          {payment.loading ? (
            <p className="mt-6 text-[13.5px] font-semibold text-sub">
              {t('common.loading')}
            </p>
          ) : null}
        </div>

        <FormError message={payment.errorMessage} />
      </section>

      <aside className="flex w-full shrink-0 flex-col lg:w-[380px]">
        <div className="flex min-h-0 flex-1 flex-col rounded-[22px] bg-card p-6 shadow-card lg:sticky lg:top-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-[16.5px] font-bold tracking-tight">
              {t('checkout.summary')}
            </h2>
            <span className="rounded-pill bg-surface px-2.5 py-1 text-[11px] font-extrabold text-sub">
              {t('payment.orderNumber', { code: order.orderCode })}
            </span>
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-3.5">
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

            <div className="mt-auto h-px bg-divider" />
            <div className="flex justify-between text-[13px] font-semibold text-sub">
              <span>{t('cart.subtotal')}</span>
              <span>{moneyFixed(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-sub">
              <span>{t('cart.vat')}</span>
              <span>{moneyFixed(order.vat)}</span>
            </div>
            <div className="flex justify-between text-[16px] font-extrabold">
              <span>{t('cart.total')}</span>
              <span className="font-display text-price">
                {moneyFixed(order.total)}
              </span>
            </div>
            {payment.meta?.currencyDisplay ? (
              <p className="text-[12px] font-semibold text-muted">
                {t('payment.chargedAs', {
                  currency: payment.meta.currencyDisplay,
                })}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <Button
              label={
                payDisabled && payment.loading
                  ? t('common.loading')
                  : t('payment.payAmount', { total: moneyFixed(order.total) })
              }
              onClick={() => void onPayPress()}
              loading={payment.paying}
              disabled={payDisabled}
              className="w-full"
            />
            {!payment.loading && !payment.ready ? (
              <button
                type="button"
                onClick={() => void payment.prepare()}
                disabled={payment.paying}
                className="py-1 text-center text-[14px] font-bold text-link"
              >
                {t('common.retry')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="py-1 text-center text-[14px] font-bold text-sub"
              >
                {t('common.back')}
              </button>
            )}
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-muted">
              <span aria-hidden>🔒</span>
              {t('checkout.secureCheckout')}
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
