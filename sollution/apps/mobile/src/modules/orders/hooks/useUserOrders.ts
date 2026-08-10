import { useMemo } from 'react';
import { useOrders } from '@/api/OrderBooking/modules/orders';
import { useAuth } from '@/context/AuthContext';
import { toAppError, type AppErrorCode } from '@/lib/errors';
import { isCurrentOrderStatus, isPastOrderStatus } from '../status';
import type { Order } from '../types';

export type UseUserOrdersResult = {
  orders: Order[];
  currentOrders: Order[];
  pastOrders: Order[];
  loading: boolean;
  errorCode: AppErrorCode | null;
  refetch: () => Promise<void>;
};

export function useUserOrders(): UseUserOrdersResult {
  const { user, authReady } = useAuth();
  const query = useOrders(authReady && Boolean(user));

  const orders = query.data ?? [];
  const loading = !authReady || query.isLoading;
  const errorCode = query.error ? toAppError(query.error).code : null;

  const currentOrders = useMemo(
    () => orders.filter((o) => isCurrentOrderStatus(o.status)),
    [orders],
  );
  const pastOrders = useMemo(
    () => orders.filter((o) => isPastOrderStatus(o.status)),
    [orders],
  );

  return {
    orders,
    currentOrders,
    pastOrders,
    loading,
    errorCode,
    refetch: async () => {
      await query.refetch();
    },
  };
}
