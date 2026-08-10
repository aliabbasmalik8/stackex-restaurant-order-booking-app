import { useCallback, useMemo, useState } from 'react';
import {
  useOrdersManage,
  useUpdateOrderStatus,
} from '@/api/OrderBooking/modules/orders';
import { isActiveOrderStatus } from '../status';
import type { Order, OrderStatus } from '../types';

export type OrdersFilter = 'all' | 'active' | 'completed' | 'cancelled';

type UseOrdersResult = {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  error: string | null;
  filter: OrdersFilter;
  setFilter: (filter: OrdersFilter) => void;
  search: string;
  setSearch: (value: string) => void;
  updatingId: string | null;
  updateError: string | null;
  clearUpdateError: () => void;
  setStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
};

export function useOrders(): UseOrdersResult {
  const ordersQuery = useOrdersManage();
  const updateMutation = useUpdateOrderStatus();
  const [filter, setFilter] = useState<OrdersFilter>('active');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const orders = useMemo(() => {
    const list = [...(ordersQuery.data ?? [])];
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [ordersQuery.data]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter === 'active' && !isActiveOrderStatus(order.status)) return false;
      if (filter === 'completed' && order.status !== 'completed') return false;
      if (filter === 'cancelled' && order.status !== 'cancelled') return false;

      if (!q) return true;
      const haystack = [
        order.orderCode,
        order.contact.name,
        order.contact.phone,
        order.branchLabel,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, filter, search]);

  const setStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      setUpdatingId(orderId);
      setUpdateError(null);
      try {
        await updateMutation.mutateAsync({ id: orderId, status });
        return true;
      } catch (err) {
        setUpdateError(
          err instanceof Error ? err.message : 'Failed to update order',
        );
        return false;
      } finally {
        setUpdatingId(null);
      }
    },
    [updateMutation],
  );

  const clearUpdateError = useCallback(() => setUpdateError(null), []);

  return {
    orders,
    filteredOrders,
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
  };
}
