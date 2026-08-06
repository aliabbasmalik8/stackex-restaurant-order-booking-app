import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MenuScreen } from '@/screens/menu/MenuScreen';

export default function MenuRoute() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="light" />
      <MenuScreen
        guestInitial="A"
        onOpenProfile={() => router.push('/(tabs)/profile')}
        onOpenCart={() => {
          // Cart screen next
        }}
        onOpenItem={() => {
          // Item detail next
        }}
      />
    </>
  );
}
