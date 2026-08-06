import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { useCart } from '@/context/CartContext';
import { useRequireAuthScreen } from '@/modules/auth';
import { PROFILE_USER } from '@/data/demo';

export default function CheckoutRoute() {
  const router = useRouter();
  const { total, placeOrder, itemCount } = useCart();
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
            name: PROFILE_USER.shortName,
            phone: PROFILE_USER.phone,
          });
          router.replace('/order-success');
        }}
      />
    </>
  );
}
