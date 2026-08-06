import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConfirmationScreen } from '@/screens/order-success/ConfirmationScreen';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/modules/catalog';
import { brand } from '@/theme';

export default function OrderSuccessRoute() {
  const router = useRouter();
  const { lastOrder } = useCart();
  const { primaryBranch } = useCatalog();

  const order = lastOrder ?? {
    orderCode: `${brand.monogram}-08`,
    readyAround: '7:55 PM',
    branchLabel: `${brand.name} · ${primaryBranch?.name ?? ''}`,
    branchLabel_arabic: `${brand.name} · ${primaryBranch?.name_arabic ?? ''}`,
    address: primaryBranch?.address ?? '',
    address_arabic: primaryBranch?.address_arabic ?? '',
    items: [],
    subtotal: 0,
    vat: 0,
    total: 0,
    createdAt: new Date().toISOString(),
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
