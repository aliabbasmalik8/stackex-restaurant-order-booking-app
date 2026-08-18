```tsx
import { useMemo, useState } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  StateMessage,
  DineOsMark,
  DineOsWordmark,
} from '@/components/ui';
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
import { useStoreAvailability } from '@/core/settings';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { NoResultsState } from '@/components/menu/NoResultsState';
import { menuGridCellStyle, useMenuGrid } from '@/components/menu/useMenuGrid';
import {
  radii,
  spacing,
  typography,
  createStyles,
  useTheme,
} from '@/theme';

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
  const { isClosed } = useStoreAvailability();

  const { isAuthenticated } = useAuth();
  const runAuthed = useAuthAction();

  const {
    categories,
    items: menuItems,
    isLoading,
    errorCode,
    error,
    refetch,
  } = useCatalog();

  const { data: addresses } = useAddresses(isAuthenticated);

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  const { cardWidth, onGridLayout } = useMenuGrid();

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

  const hasQuery = query.trim().length > 0;
  const noVisibleItems = items.length === 0 && !showFeatured;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              cartCount > 0
                ? CART_BAR_HEIGHT + spacing.xxl + spacing.md
                : spacing.xl,
          },
          ((!isLoading && !!errorCode) ||
            (noVisibleItems && hasQuery)) &&
            styles.scrollFill,
        ]}
      >
        <View
          style={[
            styles.hero,
            {
              paddingTop: insets.top + spacing.lg,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.watermarkWrap}>
            <DineOsMark
              size={typography.fontSize.watermark}
              color={colors.onHeroFaint}
            />
          </View>

          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <MenuAddressBadge
                address={defaultAddress}
                onPress={openAddressSheet}
              />

              <DineOsWordmark fontSize={typography.fontSize.xxl} />
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
            <Ionicons
              name="search"
              size={18}
              color={colors.muted}
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('menu.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
            />

            {hasQuery ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('menu.clearSearch')}
                hitSlop={8}
                onPress={() => setQuery('')}
                style={({ pressed }) => [
                  pressed && styles.clearPressed,
                ]}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            ) : null}
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
                errorCode === 'empty'
                  ? undefined
                  : () => void refetch()
              }
            />
          </View>
        ) : (
          <>
            {chipCategories.length > 1 ? (
              <CategoryChips
                categories={chipCategories}
                activeId={category}
                onChange={setCategory}
              />
            ) : null}

            <View
              style={[
                styles.grid,
                hasQuery && noVisibleItems && styles.gridFill,
              ]}
            >
              {showFeatured && featured ? (
                <FeaturedCard
                  item={featured}
                  onPress={() => onOpenItem?.(featured.id)}
                />
              ) : null}

              {noVisibleItems ? (
                <View
                  style={[
                    styles.emptyWrap,
                    hasQuery && styles.emptyFill,
                  ]}
                >
                  {hasQuery ? (
                    <NoResultsState
                      searchQuery={query.trim()}
                      onClear={() => setQuery('')}
                    />
                  ) : (
                    <StateMessage
                      compact
                      title={
                        category !== 'all'
                          ? t('menu.noCategoryTitle')
                          : t('errors.empty.title')
                      }
                      message={
                        category !== 'all'
                          ? t('menu.noCategoryMessage')
                          : t('errors.empty.message')
                      }
                      actionLabel={
                        category !== 'all'
                          ? t('menu.showAll')
                          : t('common.retry')
                      }
                      onAction={
                        category !== 'all'
                          ? () => setCategory('all')
                          : () => void refetch()
                      }
                    />
                  )}
                </View>
              ) : (
                <View
                  style={styles.pairRow}
                  onLayout={onGridLayout}
                >
                  {items.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.pairCell,
                        menuGridCellStyle(cardWidth),
                      ]}
                    >
                      <MenuItemCard
                        item={item}
                        onPress={() => onOpenItem?.(item.id)}
                        onAdd={() => onOpenItem?.(item.id)}
                        orderingDisabled={isClosed}
                      />
                    </View>
                  ))}
                </View>
              )}
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

const CART_BAR_HEIGHT = 58;

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    width: '100%',
    alignSelf: 'stretch',
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
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },

  watermarkWrap: {
    position: 'absolute',
    right: -48,
    top: -8,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    justifyContent: 'center',
    gap: spacing.xs,
  },

  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.sm,
  },

  eta: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },

  search: {
    marginTop: spacing.md,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    paddingVertical: 0,
  },

  clearPressed: {
    opacity: 0.7,
  },

  bannerWrap: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },

  grid: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    gap: spacing.md,
  },

  gridFill: {
    flexGrow: 1,
  },

  emptyWrap: {
    marginHorizontal: -spacing.screenX,
  },

  emptyFill: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 0,
    paddingVertical: spacing.xxl,
    width: '100%',
  },

  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    width: '100%',
    gap: spacing.md,
  },

  pairCell: {
    flexGrow: 0,
    flexShrink: 0,
  },

  cartWrap: {
    position: 'absolute',
    left: spacing.screenX,
    right: spacing.screenX,
    bottom: spacing.md,
  },
}));
```
