import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, StateMessage } from '@/components/ui';
import { CategoryChips } from '@/components/menu/CategoryChips';
import { FeaturedCard } from '@/components/menu/FeaturedCard';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { CartBar } from '@/components/menu/CartBar';
import { CartIconButton } from '@/components/menu/CartIconButton';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '@/modules/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { useBrand } from '@/modules/settings';
import { colors, radii, spacing, typography } from '@/theme';

interface MenuScreenProps {
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
  onOpenItem?: (id: string) => void;
}

export const MenuScreen = ({
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  onOpenItem,
}: MenuScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const brand = useBrand();
  const { categories, items: menuItems, isLoading, errorCode, refetch } =
    useCatalog();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const featured = useMemo(
    () => menuItems.find((item) => item.featured),
    [menuItems],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (item.featured) return false;
      if (category !== 'all' && item.categoryId !== category) return false;
      if (!q) return true;
      const name = localized(locale, item.name, item.name_arabic);
      const description = localized(
        locale,
        item.description,
        item.description_arabic,
      );
      return (
        name.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.name_arabic.includes(q)
      );
    });
  }, [menuItems, category, query, locale]);

  const showFeatured =
    !!featured &&
    (category === 'all' || featured.categoryId === category) &&
    (!query.trim() ||
      localized(locale, featured.name, featured.name_arabic)
        .toLowerCase()
        .includes(query.trim().toLowerCase()) ||
      featured.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      featured.name_arabic.includes(query.trim()));

  const chipCategories = useMemo(
    () => [
      { id: 'all', label: t('menu.categories.all') },
      ...categories.map((c) => ({
        id: c.id,
        label: localized(locale, c.label, c.label_arabic),
      })),
    ],
    [categories, locale, t],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingBottom: cartCount > 0 ? 100 : 24,
          },
          !!errorCode && !isLoading && styles.scrollFill,
        ]}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View pointerEvents="none" style={styles.watermarkWrap}>
            <Text style={styles.watermark}>{brand.monogram}</Text>
          </View>

          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.pickup}>{t('menu.pickupLabel')}</Text>
              <Text style={styles.brand}>{brand.name}</Text>
            </View>
            <View style={styles.heroActions}>
              <View style={styles.eta}>
                <Text style={styles.etaText}>⚡ {t('menu.eta')}</Text>
              </View>
              <CartIconButton
                tone="hero"
                count={cartCount}
                onPress={onOpenCart}
                accessibilityLabel={t('menu.viewCart')}
              />
            </View>
          </View>

          <View style={styles.search}>
            <Ionicons name="search" size={16} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('menu.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
          </View>
        </View>

        {isLoading ? (
          <MenuSkeleton />
        ) : errorCode ? (
          <View style={styles.stateFill}>
            <StateMessage
              errorCode={errorCode}
              onAction={
                errorCode === 'empty' ? undefined : () => void refetch()
              }
            />
          </View>
        ) : (
          <>
            <CategoryChips
              categories={chipCategories}
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
          </>
        )}
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
  scrollFill: {
    flexGrow: 1,
  },
  stateFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
