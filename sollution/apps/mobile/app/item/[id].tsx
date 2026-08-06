import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ItemScreen } from '@/screens/item/ItemScreen';
import { useCart } from '@/context/CartContext';
import { getMenuItem } from '@/data/mockMenu';

export default function ItemRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const itemId = typeof id === 'string' ? id : '';

  return (
    <>
      <StatusBar style="light" />
      <ItemScreen
        itemId={itemId}
        onBack={() => router.back()}
        onAdd={({
          quantity,
          unitPrice,
          optionsSummary,
          optionsSummary_arabic,
          selectedOptionIds,
        }) => {
          const item = getMenuItem(itemId);
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
            quantity,
          });
        }}
        onAdded={() => router.back()}
      />
    </>
  );
}
