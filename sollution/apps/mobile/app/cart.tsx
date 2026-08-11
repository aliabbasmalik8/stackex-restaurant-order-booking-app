import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartScreen } from '@/screens/cart/CartScreen';
import { useCart } from '@/context/CartContext';
import { useAuthAction } from '@/core/auth';

export default function CartRoute() {
  const router = useRouter();
  const { items, subtotal, vat, total, updateQuantity } = useCart();
  const runAuthed = useAuthAction('/checkout');

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
        onOpenItem={(menuItemId) =>
          router.push({ pathname: '/item/[id]', params: { id: menuItemId } })
        }
        onContinue={() =>
          runAuthed(() => {
            router.push('/checkout');
          })
        }
      />
    </>
  );
}
