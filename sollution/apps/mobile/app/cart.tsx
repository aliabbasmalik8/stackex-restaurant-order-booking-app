import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartScreen } from '@/screens/cart/CartScreen';
import { useCart } from '@/context/CartContext';

export default function CartRoute() {
  const router = useRouter();
  const { items, subtotal, vat, total, updateQuantity } = useCart();

  return (
    <>
      <StatusBar style="dark" />
      <CartScreen
        items={items}
        subtotal={subtotal}
        vat={vat}
        total={total}
        onBack={() => router.back()}
        onChangeQty={updateQuantity}
        onAddMore={() => router.replace('/(tabs)/menu')}
        onContinue={() => router.push('/checkout')}
      />
    </>
  );
}
