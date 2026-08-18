import { useTranslation } from 'react-i18next'
import {
  getFeatureStatus,
  isFeatureInteractive,
  shouldRenderFeature,
} from '@/features/_registry'

export type CheckoutPayMethod = 'card' | 'cash'

type CheckoutPaymentSectionProps = {
  pay: CheckoutPayMethod
  onChange: (method: CheckoutPayMethod) => void
}

export function CheckoutPaymentSection({
  pay,
  onChange,
}: CheckoutPaymentSectionProps) {
  const { t } = useTranslation()
  const payments = getFeatureStatus('stripePayment')
  const paymentsOn = isFeatureInteractive('stripePayment')
  const showCard = shouldRenderFeature('stripePayment')

  return (
    <section className="rounded-[22px] bg-card p-6 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="grid size-[30px] place-items-center rounded-[10px] bg-surface text-sm">
          💳
        </span>
        <h2 className="font-display text-[16.5px] font-bold tracking-tight">
          {t('checkout.payment')}
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {showCard ? (
          <button
            type="button"
            disabled={!paymentsOn}
            onClick={() => paymentsOn && onChange('card')}
            className={[
              'flex items-center gap-3 rounded-2xl px-[18px] py-[15px] text-start',
              pay === 'card' && paymentsOn
                ? 'bg-sel text-sel-text shadow-card'
                : 'border-2 border-border bg-card',
              !paymentsOn ? 'opacity-55' : '',
            ].join(' ')}
          >
            <span className="grid h-[26px] w-[38px] place-items-center rounded-[6px] bg-surface text-[9px] font-extrabold text-sub">
              VISA
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13.5px] font-extrabold">
                {t('checkout.addCard')}
              </span>
              {!paymentsOn && payments.reasonKey ? (
                <span className="text-[11px] font-semibold text-muted">
                  {t(payments.reasonKey)}
                </span>
              ) : null}
            </span>
            {pay === 'card' && paymentsOn ? (
              <span className="grid size-5 place-items-center rounded-full bg-check text-[11px] font-extrabold text-check-text">
                ✓
              </span>
            ) : null}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onChange('cash')}
          className={[
            'flex items-center gap-3 rounded-2xl px-[18px] py-[15px] text-start',
            pay === 'cash'
              ? 'bg-sel text-sel-text shadow-card'
              : 'border-2 border-border bg-card',
          ].join(' ')}
        >
          <span className="grid h-[26px] w-[38px] place-items-center rounded-[6px] bg-surface text-[12px]">
            🏪
          </span>
          <span className="flex-1 text-[13.5px] font-extrabold">
            {t('checkout.cash')}
          </span>
          {pay === 'cash' ? (
            <span className="grid size-5 place-items-center rounded-full bg-check text-[11px] font-extrabold text-check-text">
              ✓
            </span>
          ) : null}
        </button>
      </div>
    </section>
  )
}

export function resolveCheckoutPaymentMethod(
  pay: CheckoutPayMethod,
): CheckoutPayMethod {
  const showCard = shouldRenderFeature('stripePayment')
  const paymentsOn = isFeatureInteractive('stripePayment')
  return showCard && paymentsOn ? pay : 'cash'
}
