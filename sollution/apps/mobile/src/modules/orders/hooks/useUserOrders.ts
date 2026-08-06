import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toAppError, type AppErrorCode } from '@/lib/errors';
import { fetchOrdersForUser } from '../api';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);

  const refetch = useCallback(async () => {
    if (!authReady) return;
    if (!user) {
      setOrders([]);
      setErrorCode(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await fetchOrdersForUser(user.uid);
      setOrders(list);
      setErrorCode(null);
    } catch (error) {
      setErrorCode(toAppError(error).code);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authReady, user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

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
    refetch,
  };
}
