import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/OrderBooking/client'
import {
  useOrderById,
  useUpdateOrderStatus,
} from '@/api/OrderBooking/modules/orders'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { mapOrder } from '../api'
import type { Order, OrderStatus } from '../types'

type UseOrderResult = {
  order: Order | null
  loading: boolean
  error: string | null
  notFound: boolean
  updating: boolean
  updateError: string | null
  setStatus: (status: OrderStatus) => Promise<boolean>
}

export function useOrder(orderId: string | undefined): UseOrderResult {
  const { t } = useTranslation()
  const query = useOrderById(orderId ?? '', Boolean(orderId))
  const updateMutation = useUpdateOrderStatus()
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const order = useMemo(
    () => (query.data ? mapOrder(query.data) : null),
    [query.data],
  )

  const notFound = query.error instanceof ApiError && query.error.status === 404

  const setStatus = useCallback(
    async (status: OrderStatus) => {
      if (!orderId) return false
      setUpdating(true)
      setUpdateError(null)
      try {
        await updateMutation.mutateAsync({ id: orderId, status })
        return true
      } catch (err) {
        setUpdateError(getErrorMessage(err, t('errors.updateFailed')))
        return false
      } finally {
        setUpdating(false)
      }
    },
    [orderId, t, updateMutation],
  )

  return {
    order,
    loading: query.isLoading && !order,
    error: query.error
      ? getErrorMessage(query.error, t('errors.loadOrder'))
      : null,
    notFound,
    updating,
    updateError,
    setStatus,
  }
}
