import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartScreen } from '@/screens/cart/CartScreen';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CartRoute() {
  const router = useRouter();
  const { items, subtotal, vat, total, updateQuantity } = useCart();
  const { requireAuth } = useAuth();

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
        onContinue={() => {
          if (!requireAuth('/checkout')) return;
          router.push('/checkout');
        }}
      />
    </>
  );
}
