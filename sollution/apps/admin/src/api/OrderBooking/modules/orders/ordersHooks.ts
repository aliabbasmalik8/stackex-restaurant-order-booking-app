import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/modules/orders/types';
import { ordersApi } from './orders';

export const ORDERS_QUERY_KEY = ['orders', 'manage'] as const;

export function useOrdersManage(enabled = true) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ordersApi.getManage(),
    enabled,
    refetchInterval: 15_000, // fallback if live SSE is down
    staleTime: 5_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
