import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from './orders';
import type { CreateOrderDto } from './orders.types';

export const ORDERS_QUERY_KEY = ['orders'] as const;

export function useOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ordersApi.getMine(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
