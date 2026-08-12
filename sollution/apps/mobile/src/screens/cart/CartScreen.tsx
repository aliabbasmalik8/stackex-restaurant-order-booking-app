import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, QtyStepper, Text } from '@/components/ui';
import { EmptyCartIllustration } from '@/components/cart/EmptyCartIllustration';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { useStoreAvailability } from '@/core/settings';
import { localized } from '@/utils/localized';
import { money, moneyFixed } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import type { CartLine } from '@/types/cart';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface CartScreenProps {
  items: CartLine[];
  subtotal: number;
  vat: number;
  total: number;
  onBack?: () => void;
  onChangeQty: (lineId: string, qty: number) => void;
  onAddMore?: () => void;
  onContinue?: () => void;
  /** Open product detail for a cart line's menu item. */
  onOpenItem?: (menuItemId: string) => void;
}

export const CartScreen = ({
  items,
  subtotal,
  vat,
  total,
  onBack,
  onChangeQty,
  onAddMore,
  onContinue,
  onOpenItem,
}: CartScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { isClosed } = useStoreAvailability();
  const empty = items.length === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('cart.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {empty ? (
        <View style={styles.empty}>
          <EmptyCartIllustration />
          <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
          <Button
            label={t('cart.browseMenu')}
            onPress={onAddMore}
            style={styles.emptyAction}
          />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {items.map((line) => (
              <View key={line.id} style={styles.row}>
                <Pressable
                  style={styles.rowMain}
                  onPress={() => onOpenItem?.(line.menuItemId)}
                  disabled={!onOpenItem}
                >
                  <Image source={{ uri: line.image }} style={styles.thumb} />
                  <View style={styles.rowCopy}>
                    <Text style={styles.itemName}>
                      {localized(locale, line.name, line.name_arabic)}
                    </Text>
                    {line.optionsSummary ? (
                      <Text style={styles.itemOpts} numberOfLines={1}>
                        {localized(
                          locale,
                          line.optionsSummary,
                          line.optionsSummary_arabic,
                        )}
                      </Text>
                    ) : null}
                    {line.specialInstructions ? (
                      <Text style={styles.itemNote} numberOfLines={2}>
                        {line.specialInstructions}
                      </Text>
                    ) : null}
                    <Text style={styles.itemPrice}>
                      {money(line.unitPrice * line.quantity)}
                    </Text>
                  </View>
                </Pressable>
                <QtyStepper
                  size="sm"
                  value={line.quantity}
                  onChange={(q) => onChangeQty(line.id, q)}
                  min={0}
                />
              </View>
            ))}

            <Pressable onPress={onAddMore} style={styles.addMore}>
              <Text style={styles.addMoreText}>{t('cart.addMore')}</Text>
            </Pressable>

            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.totalLabel}>{moneyFixed(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('cart.vat')}</Text>
                <Text style={styles.totalLabel}>{moneyFixed(vat)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalStrong}>{t('cart.total')}</Text>
                <Text style={styles.totalStrong}>{moneyFixed(total)}</Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            {isClosed ? <StoreClosedBanner compact /> : null}
            <Button
              label={
                isClosed
                  ? t('store.closedCta')
                  : t('cart.continue', { total: moneyFixed(total) })
              }
              onPress={onContinue}
              disabled={isClosed}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  headerSpacer: { width: 40 },
  empty: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: 8,
    minWidth: 180,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  list: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minWidth: 0,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.placeholder,
  },
  rowCopy: { flex: 1, gap: 2 },
  itemName: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  itemOpts: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  itemNote: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: typography.fontWeight.regular,
    fontStyle: 'italic',
    color: colors.muted,
  },
  itemPrice: {
    marginTop: 2,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.price,
  },
  addMore: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  addMoreText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  totals: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  totalStrong: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
  },
}));
