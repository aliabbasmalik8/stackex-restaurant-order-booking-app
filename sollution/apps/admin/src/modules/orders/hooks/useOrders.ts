import { useCallback, useMemo, useState } from 'react'
import {
  useOrdersManage,
  useUpdateOrderStatus,
} from '@/api/OrderBooking/modules/orders'
import { mapOrder } from '../api'
import {
  isActiveOrderStatus,
  isDraftOrder,
  isFailedPayment,
  isUnpaidCardOrder,
} from '../status'
import type { Order, OrderStatus } from '../types'

export type OrdersFilter =
  | 'all'
  | 'active'
  | 'unpaid'
  | 'draft'
  | 'completed'
  | 'cancelled'

export type OrdersStats = {
  active: number
  unpaid: number
  draft: number
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
    let unpaid = 0
    let draft = 0
    let failed = 0
    let paidToday = 0
    let revenueToday = 0

    for (const order of orders) {
      if (isActiveOrderStatus(order.status)) active += 1
      if (isUnpaidCardOrder(order)) unpaid += 1
      if (isDraftOrder(order)) draft += 1
      if (isFailedPayment(order)) failed += 1

      const paidMoment =
        order.paidAt ??
        (order.paymentStatus === 'not_required' ? order.createdAt : null)
      if (
        (order.paymentStatus === 'paid' ||
          order.paymentStatus === 'not_required') &&
        isSameLocalDay(paidMoment)
      ) {
        paidToday += 1
        revenueToday += order.total
      }
    }

    return { active, unpaid, draft, failed, paidToday, revenueToday }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter === 'active' && !isActiveOrderStatus(order.status)) return false
      if (filter === 'unpaid' && !isUnpaidCardOrder(order)) return false
      if (filter === 'draft' && !isDraftOrder(order)) return false
      if (filter === 'completed' && order.status !== 'completed') return false
      if (filter === 'cancelled' && order.status !== 'cancelled') return false

      if (!q) return true
      const haystack = [
        order.orderCode,
        order.contact.name,
        order.contact.phone,
        order.branchLabel,
        order.paymentMethod,
        order.paymentStatus,
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
        setUpdateError(
          err instanceof Error ? err.message : 'Failed to update order',
        )
        return false
      } finally {
        setUpdatingId(null)
      }
    },
    [updateMutation],
  )

  const clearUpdateError = useCallback(() => setUpdateError(null), [])

  return {
    orders,
    filteredOrders,
    stats,
    loading: ordersQuery.isLoading,
    error:
      ordersQuery.error instanceof Error ? ordersQuery.error.message : null,
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
