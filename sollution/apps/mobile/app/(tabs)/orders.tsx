import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { useCart } from '@/context/CartContext';

export default function OrdersRoute() {
  const router = useRouter();
  const { activeOrder } = useCart();

  return (
    <>
      <StatusBar style="dark" />
      <OrdersScreen
        activeOrder={activeOrder}
        onTrack={() => router.push('/order-success')}
        onReorder={() => router.push('/(tabs)/menu')}
      />
    </>
  );
}
