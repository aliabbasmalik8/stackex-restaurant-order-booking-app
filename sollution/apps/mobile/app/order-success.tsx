import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConfirmationScreen } from '@/screens/order-success/ConfirmationScreen';
import { useCart } from '@/context/CartContext';

export default function OrderSuccessRoute() {
  const router = useRouter();
  const { lastOrder } = useCart();

  useEffect(() => {
    if (!lastOrder) {
      router.replace('/(tabs)/menu');
    }
  }, [lastOrder, router]);

  if (!lastOrder) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <ConfirmationScreen
        order={lastOrder}
        onBackToMenu={() => router.replace('/(tabs)/menu')}
      />
    </>
  );
}
