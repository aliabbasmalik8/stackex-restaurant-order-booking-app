import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toAppError, errorMessageKey } from '@/lib/errors';
import { useRequireAuthScreen } from '@/modules/auth';

export default function CheckoutRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { total, placeOrder, itemCount } = useCart();
  const { profile } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        errorMessage={errorMessage}
        onBack={() => router.back()}
        onEditProfile={() => router.push('/edit-profile')}
        onPlaceOrder={() => {
          if (itemCount === 0 || placing) {
            if (itemCount === 0) router.replace('/(tabs)/menu');
            return;
          }
          void (async () => {
            setPlacing(true);
            setErrorMessage(null);
            try {
              await placeOrder({
                name: profile?.shortName ?? profile?.name ?? 'Guest',
                phone: profile?.contact ?? '',
              });
              router.replace('/order-success');
            } catch (error) {
              const appError = toAppError(error);
              setErrorMessage(t(errorMessageKey(appError.code)));
            } finally {
              setPlacing(false);
            }
          })();
        }}
      />
    </>
  );
}
