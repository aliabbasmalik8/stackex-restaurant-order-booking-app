import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LIVE_EVENT, useLiveEvent } from '@/api/OrderBooking/Live'
import type { LiveToast } from '@/components/live/LiveToasts'

const TOAST_TTL_MS = 8_000
const MAX_TOASTS = 3

export function useLiveOrderToasts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [toasts, setToasts] = useState<LiveToast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  useLiveEvent(LIVE_EVENT.ORDER_PLACED, (event) => {
    const id = `${event.payload.orderId}-${Date.now()}`
    setToasts((current) =>
      [
        {
          id,
          orderId: event.payload.orderId,
          title: t('live.orderPlacedTitle'),
          body: t('live.orderPlacedBody', { code: event.payload.orderCode }),
        },
        ...current,
      ].slice(0, MAX_TOASTS),
    )
    window.setTimeout(() => dismiss(id), TOAST_TTL_MS)
  })

  const onOpen = useCallback(
    (toast: LiveToast) => {
      dismiss(toast.id)
      void navigate(toast.orderId ? `/orders/${toast.orderId}` : '/orders')
    },
    [dismiss, navigate],
  )

  return { toasts, dismiss, onOpen }
}
