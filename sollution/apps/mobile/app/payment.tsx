import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaymentScreen } from '@/screens/payment/PaymentScreen';
import { useRequireAuthScreen } from '@/core/auth';

export default function PaymentRoute() {
  const router = useRouter();
  const { orderId, orderCode, total, readyAround } = useLocalSearchParams<{
    orderId?: string;
    orderCode?: string;
    total?: string;
    readyAround?: string;
  }>();
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

  const parsedTotal =
    typeof total === 'string' && total.trim() !== ''
      ? Number(total)
      : NaN;

  return (
    <>
      <StatusBar style="dark" />
      <PaymentScreen
        orderId={orderId}
        orderCode={typeof orderCode === 'string' ? orderCode : undefined}
        orderTotal={Number.isFinite(parsedTotal) ? parsedTotal : undefined}
        readyAround={typeof readyAround === 'string' ? readyAround : undefined}
        onBack={() => router.back()}
        onPaid={() => router.replace('/order-success')}
      />
    </>
  );
}
