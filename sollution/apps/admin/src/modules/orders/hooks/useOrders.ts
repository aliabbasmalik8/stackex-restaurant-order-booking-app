import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useOrdersManage,
  useUpdateOrderStatus,
} from '@/api/OrderBooking/modules/orders'
import { mapOrder } from '../api'
import {
  isActiveOrderStatus,
  isAwaitingPayment,
  isFailedPayment,
} from '../status'
import { getErrorMessage } from '@/lib/getErrorMessage'
import type { Order, OrderStatus } from '../types'

export type OrdersFilter =
  | 'all'
  | 'active'
  | 'awaitingPayment'
  | 'completed'
  | 'cancelled'

export type OrdersStats = {
  active: number
  awaitingPayment: number
  failed: number
  paidToday: number
  revenueToday: number
}

function isSameLocalDay(iso: string | null | undefined, now = new Date()) {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

type UseOrdersResult = {
  orders: Order[]
  filteredOrders: Order[]
  stats: OrdersStats
  loading: boolean
  error: string | null
  filter: OrdersFilter
  setFilter: (filter: OrdersFilter) => void
  search: string
  setSearch: (value: string) => void
  updatingId: string | null
  updateError: string | null
  clearUpdateError: () => void
  setStatus: (orderId: string, status: OrderStatus) => Promise<boolean>
}

export function useOrders(): UseOrdersResult {
  const { t } = useTranslation()
  const ordersQuery = useOrdersManage()
  const updateMutation = useUpdateOrderStatus()
  const [filter, setFilter] = useState<OrdersFilter>('active')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const orders = useMemo(() => {
    const list = (ordersQuery.data ?? []).map(mapOrder)
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [ordersQuery.data])

  const stats = useMemo<OrdersStats>(() => {
    let active = 0
    let awaitingPayment = 0
    let failed = 0
    let paidToday = 0
    let revenueToday = 0

    for (const order of orders) {
      if (isActiveOrderStatus(order.status)) active += 1
      if (isAwaitingPayment(order)) awaitingPayment += 1
      if (isFailedPayment(order)) failed += 1

      const paidMoment =
        order.paidAt ??
        (order.paymentStatus === 'not_required' ? order.createdAt : null)
      if (
        (order.paymentStatus === 'paid' ||
          order.paymentStatus === 'not_required') &&
        order.status !== 'draft' &&
        isSameLocalDay(paidMoment)
      ) {
        // Skip kitchen-cancelled from "revenue today" so Cancelled+Paid
        // doesn't inflate the ops strip.
        if (order.status === 'cancelled') continue
        paidToday += 1
        revenueToday += order.total
      }
    }

    return { active, awaitingPayment, failed, paidToday, revenueToday }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter === 'active' && !isActiveOrderStatus(order.status)) return false
      if (filter === 'awaitingPayment' && !isAwaitingPayment(order)) return false
      if (filter === 'completed' && order.status !== 'completed') return false
      if (filter === 'cancelled' && order.status !== 'cancelled') return false

      if (!q) return true
      const haystack = [
        order.orderCode,
        order.contact.name,
        order.contact.phone,
        order.branchLabel,
        order.address,
        order.customerAddress?.line1,
        order.customerAddress?.line2,
        order.customerAddress?.area,
        order.customerAddress?.city,
        order.customerAddress?.notes,
        order.paymentMethod,
        order.paymentStatus,
        order.status,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [orders, filter, search])

  const setStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      setUpdatingId(orderId)
      setUpdateError(null)
      try {
        await updateMutation.mutateAsync({ id: orderId, status })
        return true
      } catch (err) {
        setUpdateError(getErrorMessage(err, t('errors.updateFailed')))
        return false
      } finally {
        setUpdatingId(null)
      }
    },
    [t, updateMutation],
  )

  const clearUpdateError = useCallback(() => setUpdateError(null), [])

  return {
    orders,
    filteredOrders,
    stats,
    loading: ordersQuery.isLoading,
    error: ordersQuery.error
      ? getErrorMessage(ordersQuery.error, t('errors.loadOrders'))
      : null,
    filter,
    setFilter,
    search,
    setSearch,
    updatingId,
    updateError,
    clearUpdateError,
    setStatus,
  }
}
