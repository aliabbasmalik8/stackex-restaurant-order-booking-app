import { useState } from 'react';
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
  const [placing, setPlacing] = useState(false);
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
        placing={placing}
        onBack={() => router.back()}
        onPlaceOrder={() => {
          if (itemCount === 0 || placing) {
            if (itemCount === 0) router.replace('/(tabs)/menu');
            return;
          }
          void (async () => {
            setPlacing(true);
            try {
              await placeOrder({
                name: profile?.shortName ?? profile?.name ?? 'Guest',
                phone: profile?.contact ?? '',
              });
              router.replace('/order-success');
            } finally {
              setPlacing(false);
            }
          })();
        }}
      />
    </>
  );
}
