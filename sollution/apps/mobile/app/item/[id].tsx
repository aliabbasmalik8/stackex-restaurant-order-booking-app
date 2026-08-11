import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ItemScreen } from '@/screens/item/ItemScreen';
import { useCart } from '@/context/CartContext';
import { useMenuItem } from '@/modules/catalog';

export default function ItemRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, itemCount } = useCart();
  const itemId = typeof id === 'string' ? id : '';
  const { item } = useMenuItem(itemId);

  return (
    <>
      <StatusBar style="light" />
      <ItemScreen
        itemId={itemId}
        cartCount={itemCount}
        onBack={() => router.back()}
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
        onAdded={() => router.back()}
      />
    </>
  );
}
