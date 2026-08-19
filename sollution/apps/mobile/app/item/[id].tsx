import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ItemScreen } from '@/screens/item/ItemScreen';
import { useCart } from '@/context/CartContext';
import { useMenuItem } from '@/core/catalog';

export default function ItemRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, itemCount } = useCart();
  const itemId = typeof id === 'string' ? id : '';
  const { item } = useMenuItem(itemId);

  const closeItem = () => {
    if (router.canDismiss()) {
      router.dismiss();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/menu');
  };

  return (
    <>
      <StatusBar style="dark" />
      <ItemScreen
        itemId={itemId}
        cartCount={itemCount}
        onBack={closeItem}
        onOpenCart={() => router.push('/cart')}
        onAdd={({
          quantity,
          unitPrice,
          optionsSummary,
          optionsSummary_arabic,
          selectedOptionIds,
          specialInstructions,
        }) => {
          if (!item) return;
          addItem({
            menuItemId: item.id,
            name: item.name,
            name_arabic: item.name_arabic,
            image: item.image,
            unitPrice,
            optionsSummary,
            optionsSummary_arabic,
            selectedOptionIds,
            specialInstructions: specialInstructions || undefined,
            quantity,
          });
        }}
        onAdded={closeItem}
      />
    </>
  );
}
