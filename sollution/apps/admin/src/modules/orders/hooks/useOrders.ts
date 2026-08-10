import { useCallback, useEffect, useState } from 'react'
import { fetchAllOrders } from '../api'
import type { Order } from '../types'

type UseOrdersResult = {
  orders: Order[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await fetchAllOrders())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { orders, loading, error, refresh }
}
