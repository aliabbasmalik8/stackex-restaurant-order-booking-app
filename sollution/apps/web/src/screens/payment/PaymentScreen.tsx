import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, FormError, Text } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import {
  hasStripePublishableKey,
  usePlatformCardPayment,
} from '@/features/stripe-payment'
import { moneyFixed } from '@/utils/money'

export function PaymentScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pendingPaymentOrder } = useCart()

  useEffect(() => {
    if (!pendingPaymentOrder) {
      navigate('/checkout', { replace: true })
    }
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
          orderId={pendingPaymentOrder.id}
          orderCode={pendingPaymentOrder.orderCode}
          total={pendingPaymentOrder.total}
          onBack={() => navigate('/checkout')}
          onPaid={() => navigate('/order-success', { replace: true })}
        />
      ) : (
        <div className="mx-auto w-full max-w-[560px] px-6 py-8">
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
  orderId,
  orderCode,
  total,
  onBack,
  onPaid,
}: {
  orderId: string
  orderCode: number
  total: number
  onBack: () => void
  onPaid: () => void
}) {
  const { t } = useTranslation()
  const { confirmPendingPaymentPaid } = useCart()
  const payment = usePlatformCardPayment(orderId)
  const Form = payment.Form

  const onPayPress = useCallback(async () => {
    const result = await payment.pay()
    if (result !== 'paid') return
    confirmPendingPaymentPaid()
    onPaid()
  }, [confirmPendingPaymentPaid, onPaid, payment])

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col overflow-y-auto px-6 py-8">
      <Text variant="subtitle" className="text-sub">
        {t('payment.subtitle')}
      </Text>
      <div className="mt-5 flex flex-col gap-1.5 rounded-[18px] border border-border bg-card p-[18px]">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted">
          {t('payment.order')}
        </span>
        <span className="font-display text-[22px] font-bold">{orderCode}</span>
        <span className="mt-2 font-display text-[28px] font-bold">
          {moneyFixed(total)}
        </span>
        {payment.meta?.currencyDisplay ? (
          <span className="text-[13px] font-semibold text-muted">
            {t('payment.chargedAs', {
              currency: payment.meta.currencyDisplay,
            })}
          </span>
        ) : null}
      </div>

      <div className="mt-4">{Form ? <Form /> : null}</div>

      {payment.loading ? (
        <p className="mt-6 text-[13.5px] font-semibold text-sub">
          {t('common.loading')}
        </p>
      ) : null}

      <FormError message={payment.errorMessage} />

      <div className="mt-auto flex flex-col gap-2.5 pt-8">
        <Button
          label={t('payment.payNow')}
          onClick={() => void onPayPress()}
          loading={payment.paying}
          disabled={!payment.ready || payment.loading || payment.paying}
          className="w-full"
        />
        {!payment.loading && !payment.ready ? (
          <button
            type="button"
            onClick={() => void payment.prepare()}
            disabled={payment.paying}
            className="py-2 text-center text-[14px] font-bold text-link"
          >
            {t('common.retry')}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="py-2 text-center text-[14px] font-bold text-sub"
          >
            {t('common.back')}
          </button>
        )}
      </div>
    </div>
  )
}
