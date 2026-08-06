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
        onAdd={({ quantity, unitPrice, optionsSummary, selectedOptionIds }) => {
          const item = getMenuItem(itemId);
          if (!item) return;
          addItem({
            menuItemId: item.id,
            name: item.name,
            image: item.image,
            unitPrice,
            optionsSummary,
            selectedOptionIds,
            quantity,
          });
        }}
        onAdded={() => router.back()}
      />
    </>
  );
}
