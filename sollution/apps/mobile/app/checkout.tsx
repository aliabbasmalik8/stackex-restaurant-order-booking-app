import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRequireAuthScreen } from '@/modules/auth';

export default function CheckoutRoute() {
  const router = useRouter();
  const { total, placeOrder, itemCount } = useCart();
  const { profile } = useAuth();
  const { allowed, authReady } = useRequireAuthScreen({
    redirectTo: '/checkout',
  });

  if (!authReady || !allowed) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <CheckoutScreen
        total={total}
        onBack={() => router.back()}
        onPlaceOrder={() => {
          if (itemCount === 0) {
            router.replace('/(tabs)/menu');
            return;
          }
          placeOrder({
            name: profile?.shortName ?? profile?.name ?? 'Guest',
            phone: profile?.contact ?? '',
          });
          router.replace('/order-success');
        }}
      />
    </>
  );
}
