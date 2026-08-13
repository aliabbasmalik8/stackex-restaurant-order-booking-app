import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toAppError, errorMessageKey, getErrorMessage } from '@/lib/errors';
import { useRequireAuthScreen } from '@/core/auth';
import { hasAddress, type UserAddress } from '@/core/profile';
import { useStoreAvailability } from '@/core/settings';
import { ApiError } from '@/api/OrderBooking/client';

export default function CheckoutRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { total, placeOrder, itemCount, removeItemsByMenuItemIds } = useCart();
  const { profile, updateUserProfile } = useAuth();
  const { isClosed, closedMessage } = useStoreAvailability();
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
        onSaveAddressToProfile={async (address: UserAddress) => {
          await updateUserProfile({ address });
        }}
        onPlaceOrder={({ phone, address, paymentMethod }) => {
          if (isClosed) {
            setErrorMessage(closedMessage);
            return;
          }
          if (itemCount === 0 || placing) {
            if (itemCount === 0) router.replace('/(tabs)/menu');
            return;
          }
          if (!phone) {
            setErrorMessage(t('checkout.phoneRequired'));
            return;
          }
          if (!hasAddress(address)) {
            setErrorMessage(t('checkout.addressRequired'));
            return;
          }
          void (async () => {
            setPlacing(true);
            setErrorMessage(null);
            try {
              if (phone !== (profile?.phone?.trim() ?? '')) {
                await updateUserProfile({ contactPhone: phone });
              }
              const order = await placeOrder({
                name: profile?.shortName ?? profile?.name ?? 'Guest',
                phone,
                address,
                paymentMethod,
              });
              if (paymentMethod === 'card') {
                router.replace({
                  pathname: '/payment',
                  params: { orderId: order.id },
                });
                return;
              }
              router.replace('/order-success');
            } catch (error) {
              if (error instanceof ApiError && error.status === 503) {
                setErrorMessage(
                  getErrorMessage(error, error.message || closedMessage),
                );
              } else {
                const appError = toAppError(error);
                if (
                  appError.code === 'item_unavailable' &&
                  appError.unavailableMenuItemIds?.length
                ) {
                  removeItemsByMenuItemIds(appError.unavailableMenuItemIds);
                }
                const fallback =
                  appError.code === 'store_closed'
                    ? closedMessage || t(errorMessageKey(appError.code))
                    : t(errorMessageKey(appError.code));
                setErrorMessage(getErrorMessage(error, fallback));
              }
            } finally {
              setPlacing(false);
            }
          })();
        }}
      />
    </>
  );
}
