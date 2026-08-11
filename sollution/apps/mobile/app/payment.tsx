import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaymentScreen } from '@/screens/payment/PaymentScreen';
import { useRequireAuthScreen } from '@/modules/auth';

export default function PaymentRoute() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/checkout',
  });

  if (!authReady || !allowed) {
    return null;
  }

  if (!orderId || typeof orderId !== 'string') {
    router.replace('/(tabs)/menu');
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <PaymentScreen
        orderId={orderId}
        onBack={() => router.back()}
        onPaid={() => router.replace('/order-success')}
      />
    </>
  );
}
