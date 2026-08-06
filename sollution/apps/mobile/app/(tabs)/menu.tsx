import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuScreen } from '@/screens/menu/MenuScreen';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useAuthAction } from '@/modules/auth';
import { PROFILE_USER } from '@/data/demo';

export default function MenuRoute() {
  const router = useRouter();
  const { itemCount, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const openProfile = useAuthAction('/(tabs)/profile');

  return (
    <>
      <StatusBar style="light" />
      <MenuScreen
        guestInitial={isAuthenticated ? PROFILE_USER.initial : 'G'}
        cartCount={itemCount}
        cartTotal={subtotal}
        onOpenProfile={() =>
          openProfile(() => {
            router.push('/(tabs)/profile');
          })
        }
        onOpenCart={() => router.push('/cart')}
        onOpenItem={(id) =>
          router.push({ pathname: '/item/[id]', params: { id } })
        }
      />
    </>
  );
}
