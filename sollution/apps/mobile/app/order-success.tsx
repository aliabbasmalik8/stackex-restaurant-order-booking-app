import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ConfirmationScreen } from '@/screens/order-success/ConfirmationScreen';
import { useCart } from '@/context/CartContext';
import { brand } from '@/theme';
import { BRANCH } from '@/data/mockMenu';

export default function OrderSuccessRoute() {
  const router = useRouter();
  const { lastOrder } = useCart();

  const order = lastOrder ?? {
    orderCode: `${brand.monogram}-08`,
    readyAround: '7:55 PM',
    branchLabel: `${brand.name} · ${BRANCH.name}`,
    branchLabel_arabic: `${brand.name} · ${BRANCH.name_arabic}`,
    address: BRANCH.address,
    address_arabic: BRANCH.address_arabic,
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
