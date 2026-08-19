import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/modules/orders/types';
import { ordersApi } from './orders';
import type { OrderDto } from './orders.types';

export const ORDERS_ROOT_QUERY_KEY = ['orders'] as const;
export const ORDERS_QUERY_KEY = ['orders', 'manage'] as const;

export function orderDetailQueryKey(id: string) {
  return ['orders', 'detail', id] as const;
}

export function useOrdersManage(enabled = true) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ordersApi.getManage(),
    enabled,
    refetchInterval: 15_000, // fallback if live SSE is down
    staleTime: 5_000,
  });
}

export function useOrderById(id: string, enabled = true) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: orderDetailQueryKey(id),
    queryFn: () => ordersApi.getById(id),
    enabled: enabled && Boolean(id),
    staleTime: 5_000,
    initialData: () =>
      queryClient
        .getQueryData<OrderDto[]>(ORDERS_QUERY_KEY)
        ?.find((order) => order.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(ORDERS_QUERY_KEY)?.dataUpdatedAt,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_ROOT_QUERY_KEY });
    },
  });
}
