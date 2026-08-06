import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { CategoryChips } from '@/components/menu/CategoryChips';
import { FeaturedCard } from '@/components/menu/FeaturedCard';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { CartBar } from '@/components/menu/CartBar';
import { MENU_COPY } from '@/constants';
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  type MenuCategoryId,
} from '@/data/mockMenu';
import { brand, colors, radii, spacing, typography } from '@/theme';

interface MenuScreenProps {
  guestInitial?: string;
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
  onOpenItem?: (id: string) => void;
  onOpenProfile?: () => void;
}

export const MenuScreen = ({
  guestInitial = 'G',
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  onOpenItem,
  onOpenProfile,
}: MenuScreenProps) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<MenuCategoryId>('all');
  const [query, setQuery] = useState('');

  const featured = useMemo(
    () => MENU_ITEMS.find((item) => item.featured),
    [],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU_ITEMS.filter((item) => {
      if (item.featured) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const showFeatured =
    !!featured &&
    (category === 'all' || featured.category === category) &&
    (!query.trim() ||
      featured.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: cartCount > 0 ? 100 : 24,
        }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View pointerEvents="none" style={styles.watermarkWrap}>
            <Text style={styles.watermark}>{brand.monogram}</Text>
          </View>

          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.pickup}>{MENU_COPY.pickupLabel}</Text>
              <Text style={styles.brand}>{brand.name}</Text>
            </View>
            <View style={styles.heroActions}>
              <View style={styles.eta}>
                <Text style={styles.etaText}>⚡ {MENU_COPY.eta}</Text>
              </View>
              <Pressable onPress={onOpenProfile} style={styles.avatar}>
                <Text style={styles.avatarText}>{guestInitial}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.search}>
            <Ionicons name="search" size={16} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={MENU_COPY.searchPlaceholder}
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
          </View>
        </View>

        <CategoryChips
          categories={MENU_CATEGORIES}
          activeId={category}
          onChange={setCategory}
        />

        <View style={styles.grid}>
          {showFeatured && featured ? (
            <FeaturedCard
              item={featured}
              onPress={() => onOpenItem?.(featured.id)}
            />
          ) : null}

          <View style={styles.pairRow}>
            {items.map((item) => (
              <View key={item.id} style={styles.pairCell}>
                <MenuItemCard
                  item={item}
                  onPress={() => onOpenItem?.(item.id)}
                  onAdd={() => onOpenItem?.(item.id)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {cartCount > 0 ? (
        <View style={styles.cartWrap}>
          <CartBar
            count={cartCount}
            total={cartTotal}
            onPress={onOpenCart}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.hero,
    paddingHorizontal: spacing.screenX,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  watermarkWrap: {
    position: 'absolute',
    right: -30,
    top: 6,
  },
  watermark: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    fontSize: 110,
    color: 'rgba(255,255,255,0.08)',
    lineHeight: 110,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCopy: { gap: 1 },
  pickup: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  brand: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 25,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.5,
    color: colors.onHero,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eta: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  search: {
    marginTop: 14,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    paddingVertical: 0,
  },
  grid: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 14,
    gap: 14,
  },
  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pairCell: {
    width: '48%',
    maxWidth: '48%',
  },
  cartWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
  },
});
