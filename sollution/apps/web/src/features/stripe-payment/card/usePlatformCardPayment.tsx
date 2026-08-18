import { useMemo, useRef, type ComponentType, type MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { getStripePublishableKey } from '../config'
import { useCardPaymentSession } from './useCardPaymentSession'
import type {
  CardPaymentConfirmResult,
  CardPaymentDriver,
  CardPaymentSession,
  WebStripeHandles,
} from './types'

const publishableKey = getStripePublishableKey()
const stripePromise = publishableKey
  ? loadStripe(publishableKey, {
      developerTools: { assistant: { enabled: false } },
    })
  : null

function useWebElementsDriver(handles: WebStripeHandles): CardPaymentDriver {
  const handlesRef = useRef(handles)
  handlesRef.current = handles

  return useMemo<CardPaymentDriver>(
    () => ({
      prepare: async () => undefined,
      confirm: async (): Promise<CardPaymentConfirmResult> => {
        const stripe = handlesRef.current.getStripe() as Stripe | null
        const elements = handlesRef.current.getElements() as StripeElements | null
        if (!stripe || !elements) {
          return {
            status: 'failed',
            message: 'Payment form is not ready yet.',
          }
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        })

        if (error) {
          return {
            status: 'failed',
            message: error.message ?? 'Payment failed',
          }
        }

        if (
          paymentIntent &&
          (paymentIntent.status === 'succeeded' ||
            paymentIntent.status === 'processing')
        ) {
          return { status: 'succeeded' }
        }

        return {
          status: 'failed',
          message: `Unexpected payment status: ${paymentIntent?.status ?? 'unknown'}`,
        }
      },
    }),
    [],
  )
}

function WebElementsBinder({
  stripeRef,
  elementsRef,
}: {
  stripeRef: MutableRefObject<Stripe | null>
  elementsRef: MutableRefObject<StripeElements | null>
}) {
  const stripe = useStripe()
  const elements = useElements()
  stripeRef.current = stripe
  elementsRef.current = elements

  return (
    <div className="rounded-[18px] border border-border bg-card p-3.5">
      <PaymentElement options={{ layout: 'tabs' }} />
    </div>
  )
}

export type PlatformCardPayment = CardPaymentSession & {
  Form: ComponentType
}

export function usePlatformCardPayment(orderId: string): PlatformCardPayment {
  const { t } = useTranslation()
  const stripeRef = useRef<Stripe | null>(null)
  const elementsRef = useRef<StripeElements | null>(null)

  const handles = useMemo(
    () => ({
      getStripe: () => stripeRef.current,
      getElements: () => elementsRef.current,
    }),
    [],
  )

  const driver = useWebElementsDriver(handles)
  const session = useCardPaymentSession({ orderId, driver, t })
  const clientSecret = session.clientSecret

  const Form = useMemo(() => {
    function WebCardPaymentForm() {
      if (!clientSecret || !stripePromise) return null
      return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <WebElementsBinder stripeRef={stripeRef} elementsRef={elementsRef} />
        </Elements>
      )
    }
    return WebCardPaymentForm
  }, [clientSecret])

  return { ...session, Form }
}
