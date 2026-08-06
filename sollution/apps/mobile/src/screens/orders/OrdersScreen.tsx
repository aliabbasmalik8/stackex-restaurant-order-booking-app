import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { PAST_ORDERS, localized, moneyFixed } from '@/data/mockMenu';
import { useLanguage } from '@/i18n/LanguageContext';
import type { PlacedOrder } from '@/types/cart';
import { colors, radii, spacing, typography } from '@/theme';

interface OrdersScreenProps {
  activeOrder?: PlacedOrder | null;
  onTrack?: () => void;
  onReorder?: (id: string) => void;
}

export const OrdersScreen = ({
  activeOrder,
  onTrack,
  onReorder,
}: OrdersScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const summary = activeOrder
    ? activeOrder.items
        .map((l) => localized(locale, l.name, l.name_arabic))
        .slice(0, 2)
        .join(', ') +
      (activeOrder.items.length > 2
        ? ` +${activeOrder.items.length - 2}`
        : '')
    : '';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{t('orders.title')}</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {activeOrder ? (
          <View style={styles.activeCard}>
            <View style={styles.activeTop}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{t('orders.preparingNow')}</Text>
              </View>
              <Text style={styles.code}>{activeOrder.orderCode}</Text>
            </View>
            <Text style={styles.activeTitle}>{summary}</Text>
            <Text style={styles.activeMeta}>
              {t('orders.readyAround', {
                time: activeOrder.readyAround,
                total: moneyFixed(activeOrder.total),
              })}
            </Text>
            <View style={styles.track}>
              <View style={styles.trackFill} />
            </View>
            <Button
              label={t('orders.trackOrder')}
              onPress={onTrack}
              style={styles.trackBtn}
            />
          </View>
        ) : null}

        <Text style={styles.pastHead}>{t('orders.pastOrders')}</Text>
        {PAST_ORDERS.map((order) => (
          <View key={order.id} style={styles.pastRow}>
            <Image source={{ uri: order.image }} style={styles.pastThumb} />
            <View style={styles.pastCopy}>
              <Text style={styles.pastTitle}>
                {localized(locale, order.title, order.title_arabic)}
              </Text>
              <Text style={styles.pastMeta}>
                {localized(locale, order.date, order.date_arabic)} ·{' '}
                {moneyFixed(order.total)}
              </Text>
            </View>
            <Pressable
              onPress={() => onReorder?.(order.id)}
              style={styles.reorder}
            >
              <Text style={styles.reorderText}>{t('orders.reorder')}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  list: {
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
  },
  activeCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  statusText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  code: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.price,
  },
  activeTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  activeMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    marginTop: -8,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  trackFill: {
    width: '40%',
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.price,
  },
  trackBtn: { height: 44 },
  pastHead: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  pastThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.placeholder,
  },
  pastCopy: { flex: 1, gap: 1 },
  pastTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  pastMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  reorder: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  reorderText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
});
