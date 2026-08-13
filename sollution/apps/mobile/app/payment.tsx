import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaymentScreen } from '@/screens/payment/PaymentScreen';
import { useCart } from '@/context/CartContext';
import { useRequireAuthScreen } from '@/core/auth';

export default function PaymentRoute() {
  const router = useRouter();
  const { pendingPaymentOrder, lastOrder } = useCart();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/checkout',
  });

  const validOrderId = typeof orderId === 'string' && orderId.length > 0;
  const pendingMatches =
    validOrderId && pendingPaymentOrder?.id === orderId;
  const justPaid = validOrderId && lastOrder?.id === orderId;

  useEffect(() => {
    if (!authReady || !allowed) return;
    if (!validOrderId) {
      router.replace('/(tabs)/menu');
      return;
    }
    if (justPaid) {
      router.replace('/order-success');
      return;
    }
    if (!pendingMatches) {
      router.replace('/checkout');
    }
  }, [
    allowed,
    authReady,
    justPaid,
    pendingMatches,
    router,
    validOrderId,
  ]);

  if (!authReady || !allowed || !pendingMatches || !pendingPaymentOrder) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <PaymentScreen
        order={pendingPaymentOrder}
        onBack={() => router.back()}
        onPaid={() => router.replace('/order-success')}
      />
    </>
  );
}
