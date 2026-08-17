import { useMemo, useState } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, StateMessage } from '@/components/ui';
import { AddressPickerSheet } from '@/components/menu/AddressPickerSheet';
import { CategoryChips } from '@/components/menu/CategoryChips';
import { FeaturedCard } from '@/components/menu/FeaturedCard';
import { MenuAddressBadge } from '@/components/menu/MenuAddressBadge';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { CartBar } from '@/components/menu/CartBar';
import { CartIconButton } from '@/components/menu/CartIconButton';
import { useTranslation } from 'react-i18next';
import { useAddresses } from '@/api/OrderBooking/modules/addresses';
import { useAuth } from '@/context/AuthContext';
import { useAuthAction } from '@/core/auth';
import { useCatalog } from '@/core/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { useBrand, useStoreAvailability } from '@/core/settings';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const brand = useBrand();
  const { isClosed } = useStoreAvailability();
  const { isAuthenticated } = useAuth();
  const runAuthed = useAuthAction();
  const { categories, items: menuItems, isLoading, errorCode, error, refetch } =
    useCatalog();
  const { data: addresses } = useAddresses(isAuthenticated);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  const openAddressSheet = () => {
    runAuthed(() => setAddressSheetOpen(true));
  };

  const defaultAddress =
    addresses?.find((row) => row.isDefault) ?? addresses?.[0] ?? null;

  const featured = useMemo(
    () => menuItems.find((item) => item.featured),
    [menuItems],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      // Only the banner featured item is excluded from the grid;
      // additional featured products still appear as normal cards.
      if (featured && item.id === featured.id) return false;
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
  }, [menuItems, featured, category, query, locale]);

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
              <MenuAddressBadge
                address={defaultAddress}
                onPress={openAddressSheet}
              />
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

        {isClosed ? (
          <View style={styles.bannerWrap}>
            <StoreClosedBanner />
          </View>
        ) : null}

        {isLoading ? (
          <MenuSkeleton />
        ) : errorCode ? (
          <View style={styles.stateFill}>
            <StateMessage
              errorCode={errorCode}
              error={error}
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
                      orderingDisabled={isClosed}
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

      <AddressPickerSheet
        visible={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
      />
    </View>
  );
};

const styles = createStyles((colors) => ({
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
  heroCopy: { flex: 1, minWidth: 0, paddingRight: 8, justifyContent: 'center' },
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
  bannerWrap: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
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
}));
