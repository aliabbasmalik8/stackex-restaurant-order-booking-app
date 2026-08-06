import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuScreen } from '@/screens/menu/MenuScreen';
import { useCart } from '@/context/CartContext';
import { PROFILE_USER } from '@/data/mockMenu';

export default function MenuRoute() {
  const router = useRouter();
  const { itemCount, subtotal } = useCart();

  return (
    <>
      <StatusBar style="light" />
      <MenuScreen
        guestInitial={PROFILE_USER.initial}
        cartCount={itemCount}
        cartTotal={subtotal}
        onOpenProfile={() => router.push('/(tabs)/profile')}
        onOpenCart={() => router.push('/cart')}
        onOpenItem={(id) =>
          router.push({ pathname: '/item/[id]', params: { id } })
        }
      />
    </>
  );
}
