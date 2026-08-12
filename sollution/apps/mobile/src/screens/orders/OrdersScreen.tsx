import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, StateMessage, Text } from '@/components/ui';
import { localized } from '@/utils/localized';
import { moneyFixed } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import type { AppErrorCode } from '@/lib/errors';
import type { Order, OrderStatus } from '@/core/orders';
import { colors, radii, spacing, typography } from '@/theme';

export type OrdersFilter = 'current' | 'previous';

interface OrdersScreenProps {
  currentOrders: Order[];
  pastOrders: Order[];
  loading?: boolean;
  errorCode?: AppErrorCode | null;
  error?: unknown;
  onRetry?: () => void;
  onTrack?: (order: Order) => void;
  onReorder?: (order: Order) => void;
  onBrowseMenu?: () => void;
}

function statusLabelKey(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'orders.status.pending';
    case 'confirmed':
      return 'orders.status.confirmed';
    case 'preparing':
      return 'orders.status.preparing';
    case 'ready':
      return 'orders.status.ready';
    case 'completed':
      return 'orders.status.completed';
    case 'cancelled':
      return 'orders.status.cancelled';
    default:
      return 'orders.status.pending';
  }
}

function formatOrderDate(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
  });
}

function itemSummary(order: Order, locale: string): string {
  const names = order.items.map((l) =>
    localized(locale, l.name, l.name_arabic),
  );
  const head = names.slice(0, 2).join(', ');
  return names.length > 2 ? `${head} +${names.length - 2}` : head;
}

export const OrdersScreen = ({
  currentOrders,
  pastOrders,
  loading,
  errorCode,
  error,
  onRetry,
  onTrack,
  onReorder,
  onBrowseMenu,
}: OrdersScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [filter, setFilter] = useState<OrdersFilter>('current');

  const list = filter === 'current' ? currentOrders : pastOrders;
  const empty =
    !loading && !errorCode && list.length === 0;

  const emptyTitle =
    filter === 'current'
      ? t('orders.emptyCurrentTitle')
      : t('orders.emptyPreviousTitle');
  const emptyMessage =
    filter === 'current'
      ? t('orders.emptyCurrentMessage')
      : t('orders.emptyPreviousMessage');

  const filters = useMemo(
    () =>
      [
        {
          id: 'current' as const,
          label: t('orders.filterCurrent'),
          count: currentOrders.length,
        },
        {
          id: 'previous' as const,
          label: t('orders.filterPrevious'),
          count: pastOrders.length,
        },
      ] as const,
    [t, currentOrders.length, pastOrders.length],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{t('orders.title')}</Text>

      <View style={styles.segment}>
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.segBtn, active && styles.segActive]}
            >
              <Text
                style={[styles.segLabel, active && styles.segLabelActive]}
              >
                {f.label}
                {f.count > 0 ? ` (${f.count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading || errorCode || empty ? (
        <View style={styles.stateWrap}>
          <StateMessage
            loading={loading}
            errorCode={errorCode}
            error={error}
            title={empty ? emptyTitle : undefined}
            message={empty ? emptyMessage : undefined}
            actionLabel={
              empty
                ? t('orders.browseMenu')
                : errorCode
                  ? t('common.retry')
                  : undefined
            }
            onAction={
              empty
                ? onBrowseMenu
                : errorCode
                  ? onRetry
                  : undefined
            }
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {filter === 'current'
            ? list.map((order) => (
                <View key={order.id} style={styles.activeCard}>
                  <View style={styles.activeTop}>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>
                        {t(statusLabelKey(order.status))}
                      </Text>
                    </View>
                    <Text style={styles.code}>{order.orderCode}</Text>
                  </View>
                  <Text style={styles.activeTitle}>
                    {itemSummary(order, locale)}
                  </Text>
                  <Text style={styles.activeMeta}>
                    {t('orders.readyAround', {
                      time: order.readyAround ?? '—',
                      total: moneyFixed(order.total),
                    })}
                  </Text>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.trackFill,
                        order.status === 'ready' && styles.trackFillReady,
                        order.status === 'pending' && styles.trackFillPending,
                      ]}
                    />
                  </View>
                  <Button
                    label={t('orders.trackOrder')}
                    onPress={() => onTrack?.(order)}
                    style={styles.trackBtn}
                  />
                </View>
              ))
            : list.map((order) => {
                const thumb = order.items[0]?.image;
                return (
                  <View key={order.id} style={styles.pastRow}>
                    {thumb ? (
                      <Image
                        source={{ uri: thumb }}
                        style={styles.pastThumb}
                      />
                    ) : (
                      <View style={styles.pastThumb} />
                    )}
                    <View style={styles.pastCopy}>
                      <Text style={styles.pastTitle}>
                        {itemSummary(order, locale) || order.orderCode}
                      </Text>
                      <Text style={styles.pastMeta}>
                        {formatOrderDate(order.createdAt, locale)} ·{' '}
                        {moneyFixed(order.total)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => onReorder?.(order)}
                      style={styles.reorder}
                    >
                      <Text style={styles.reorderText}>
                        {t('orders.reorder')}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
        </ScrollView>
      )}
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
  segment: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  segActive: {
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  segLabelActive: {
    color: colors.ink,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
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
  trackFillPending: { width: '20%' },
  trackFillReady: { width: '90%' },
  trackBtn: { height: 44 },
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
