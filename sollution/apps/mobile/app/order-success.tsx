import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConfirmationScreen } from '@/screens/order-success/ConfirmationScreen';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/core/catalog';
import { useBrand } from '@/core/settings';

export default function OrderSuccessRoute() {
  const router = useRouter();
  const brand = useBrand();
  const { lastOrder } = useCart();
  const { primaryBranch } = useCatalog();

  const order = lastOrder ?? {
    id: 'local',
    userId: '',
    orderCode: `${brand.monogram}-08`,
    status: 'preparing' as const,
    readyAround: '7:55 PM',
    branchLabel: `${brand.name} · ${primaryBranch?.name ?? ''}`,
    branchLabel_arabic: `${brand.name} · ${primaryBranch?.name_arabic ?? ''}`,
    address: primaryBranch?.address ?? '',
    address_arabic: primaryBranch?.address_arabic ?? '',
    items: [],
    subtotal: 0,
    vat: 0,
    total: 0,
    customerAddress: null,
    contact: { name: '', phone: '' },
    paymentMethod: 'cash' as const,
    paymentStatus: 'not_required' as const,
    stripePaymentIntentId: null,
    paidAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <>
      <StatusBar style="light" />
      <ConfirmationScreen
        order={order}
        onBackToMenu={() => router.replace('/(tabs)/menu')}
      />
    </>
  );
}
