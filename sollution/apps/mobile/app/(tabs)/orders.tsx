import { StatusBar } from 'expo-status-bar';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';

export default function OrdersRoute() {
  return (
    <>
      <StatusBar style="dark" />
      <OrdersScreen />
    </>
  );
}
