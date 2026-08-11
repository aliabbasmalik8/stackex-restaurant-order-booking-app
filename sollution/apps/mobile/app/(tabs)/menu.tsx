import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuScreen } from '@/screens/menu/MenuScreen';
import { useCart } from '@/context/CartContext';

export default function MenuRoute() {
  const router = useRouter();
  const { itemCount, subtotal } = useCart();

  return (
    <>
      <StatusBar style="light" />
      <MenuScreen
        cartCount={itemCount}
        cartTotal={subtotal}
        onOpenCart={() => router.push('/cart')}
        onOpenItem={(id) =>
          router.push({ pathname: '/item/[id]', params: { id } })
        }
      />
    </>
  );
}
