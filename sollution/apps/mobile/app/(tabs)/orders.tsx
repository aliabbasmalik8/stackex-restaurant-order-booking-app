import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { useCart } from '@/context/CartContext';
import { useRequireAuthScreen } from '@/core/auth';
import { useUserOrders, type Order } from '@/core/orders';

export default function OrdersRoute() {
  const router = useRouter();
  const { setLastOrder } = useCart();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/(tabs)/orders',
  });
  const {
    currentOrders,
    pastOrders,
    loading,
    errorCode,
    error,
    refetch,
  } = useUserOrders();

  useFocusEffect(
    useCallback(() => {
      if (allowed) void refetch();
    }, [allowed, refetch]),
  );

  if (!authReady || !allowed) {
    return null;
  }

  const onTrack = (order: Order) => {
    setLastOrder(order);
    router.push('/order-success');
  };

  return (
    <>
      <StatusBar style="dark" />
      <OrdersScreen
        currentOrders={currentOrders}
        pastOrders={pastOrders}
        loading={loading}
        errorCode={errorCode}
        error={error}
        onRetry={() => void refetch()}
        onTrack={onTrack}
        onReorder={() => router.push('/(tabs)/menu')}
        onBrowseMenu={() => router.push('/(tabs)/menu')}
      />
    </>
  );
}
