import { useQuery } from '@tanstack/react-query'
import { ordersApi } from './orders'

export const ORDERS_QUERY_KEY = ['orders'] as const

export function useOrders(
  enabled: boolean = true,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ordersApi.getMine(),
    enabled,
    staleTime: 60 * 1000,
    refetchInterval: options?.refetchInterval,
  })
}
