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
  const cardSelected = pay === 'card' && paymentsOn

  return (
    <section className="rounded-[22px] bg-card p-6 shadow-card">
      <h2 className="font-display text-[16.5px] font-bold tracking-tight">
        {t('checkout.payment')}
      </h2>

      <div
        className={[
          'mt-4 grid gap-2.5',
          showCard ? 'sm:grid-cols-2' : 'grid-cols-1',
        ].join(' ')}
      >
        {showCard ? (
          <button
            type="button"
            disabled={!paymentsOn}
            onClick={() => paymentsOn && onChange('card')}
            className={[
              'flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-start',
              cardSelected
                ? 'bg-hero text-on-hero shadow-card'
                : 'border border-border bg-card',
              !paymentsOn ? 'opacity-55' : '',
            ].join(' ')}
          >
            <span
              className={[
                'grid size-9 shrink-0 place-items-center rounded-[10px] text-sm',
                cardSelected ? 'bg-white/14' : 'bg-surface',
              ].join(' ')}
              aria-hidden
            >
              💳
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] font-extrabold">
              {t('checkout.addCard')}
            </span>
            {cardSelected ? (
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-check text-[11px] font-extrabold text-check-text">
                ✓
              </span>
            ) : null}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onChange('cash')}
          className={[
            'flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-start',
            pay === 'cash'
              ? 'bg-hero text-on-hero shadow-card'
              : 'border border-border bg-card',
          ].join(' ')}
        >
          <span
            className={[
              'grid size-9 shrink-0 place-items-center rounded-[10px] text-sm',
              pay === 'cash' ? 'bg-white/14' : 'bg-surface',
            ].join(' ')}
            aria-hidden
          >
            🏪
          </span>
          <span className="min-w-0 flex-1 text-[13.5px] font-extrabold">
            {t('checkout.cash')}
          </span>
          {pay === 'cash' ? (
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-check text-[11px] font-extrabold text-check-text">
              ✓
            </span>
          ) : null}
        </button>
      </div>

      {showCard && !paymentsOn && payments.reasonKey ? (
        <p className="mt-3 text-[12px] font-semibold text-muted">
          {t(payments.reasonKey)}
        </p>
      ) : null}

      {cardSelected ? (
        <div className="mt-4 rounded-[16px] border border-border bg-surface px-4 py-4">
          <p className="text-[12.5px] font-semibold leading-snug text-sub">
            {t('checkout.cardDetailsNext')}
          </p>
        </div>
      ) : null}
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
