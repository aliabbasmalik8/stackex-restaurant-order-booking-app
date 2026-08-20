import { useEffect, useMemo, useRef, useState } from 'react';

import {
  View,
  ScrollView,
  Image,
  Pressable,
  type LayoutChangeEvent,
} from 'react-native';

import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { Button, StateMessage, Text } from '@/components/ui';

import { localized } from '@/utils/localized';

import { moneyFixed } from '@/utils/money';

import { useLanguage } from '@/i18n/LanguageContext';

import type { AppErrorCode } from '@/lib/errors';

import type { Order, OrderStatus } from '@/core/orders';

import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
  });
}

function itemSummary(order: Order, locale: string): string {
  const names = order.items.map((item) =>
    localized(locale, item.name, item.name_arabic),
  );

  const head = names.slice(0, 2).join(', ');

  return names.length > 2 ? `${head} +${names.length - 2}` : head;
}

/* -------------------------------------------------------------------------- */
/* Order progress                                                             */
/* -------------------------------------------------------------------------- */

/*
 * Visual order flow:
 *
 * Received → Preparing → Ready → Delivered
 *
 * Backend statuses:
 *
 * draft       → no meaningful progress
 * pending     → Received
 * confirmed   → Received
 * preparing   → Preparing
 * ready       → Ready
 * completed   → Delivered
 * cancelled   → cancelled state / no normal progress
 */

type ProgressStep = 0 | 1 | 2 | 3;

function progressFraction(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 0.25;

    case 'confirmed':
      return 0.25;

    case 'preparing':
      return 0.5;

    case 'ready':
      return 0.75;

    case 'completed':
      return 1;

    case 'draft':
      return 0;

    case 'cancelled':
      return 0;

    default:
      return 0;
  }
}

function progressStepActive(
  status: OrderStatus,
  step: ProgressStep,
): boolean {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return step === 0;

    case 'preparing':
      return step <= 1;

    case 'ready':
      return step <= 2;

    case 'completed':
      return true;

    case 'draft':
    case 'cancelled':
    default:
      return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Tab animation                                                              */
/* -------------------------------------------------------------------------- */

const TAB_DURATION = 360;
const TAB_SLIDE = 24;

const TAB_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.9,
  reduceMotion: ReduceMotion.System,
} as const;

/* -------------------------------------------------------------------------- */
/* Animated order card                                                        */
/* -------------------------------------------------------------------------- */

function AnimatedOrderCard({
  children,
}: {
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const pressIn = () => {
    scale.value = withSpring(0.985, {
      damping: 18,
      stiffness: 260,
      mass: 0.6,
      reduceMotion: ReduceMotion.System,
    });
  };

  const pressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 260,
      mass: 0.6,
      reduceMotion: ReduceMotion.System,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{ width: '100%' }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* Orders Screen                                                              */
/* -------------------------------------------------------------------------- */

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
  const { colors } = useTheme();

  const insets = useSafeAreaInsets();

  const { t } = useTranslation();

  const { locale, isRTL } = useLanguage();

  const [filter, setFilter] = useState<OrdersFilter>('current');

  const [segmentW, setSegmentW] = useState(0);

  const pillReady = useRef(false);

  const pillX = useSharedValue(0);

  const pillW = useSharedValue(0);

  const pane = useSharedValue(1);

  const paneDirection = useSharedValue(1);

  const list = filter === 'current' ? currentOrders : pastOrders;

  const empty = !loading && !errorCode && list.length === 0;

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

  /* ---------------------------------------------------------------------- */
  /* Filter change                                                          */
  /* ---------------------------------------------------------------------- */

  const selectFilter = (id: OrdersFilter) => {
    if (id === filter) {
      return;
    }

    const goingPrevious = id === 'previous';

    /*
     * Current → Previous:
     * content moves toward the left.
     *
     * Previous → Current:
     * content moves toward the right.
     *
     * RTL reverses the direction.
     */
    const direction = goingPrevious ? -1 : 1;

    paneDirection.value = isRTL ? -direction : direction;

    /*
     * Start new content slightly transparent and shifted.
     * React renders the new list immediately, then this animates it
     * into position.
     */
    pane.value = 0;

    setFilter(id);
  };

  /* ---------------------------------------------------------------------- */
  /* Animate new tab content                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    pane.value = withTiming(1, {
      duration: TAB_DURATION,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [filter, pane]);

  /* ---------------------------------------------------------------------- */
  /* Segment layout                                                         */
  /* ---------------------------------------------------------------------- */

  const onSegmentLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    if (width <= 0) {
      return;
    }

    if (Math.abs(width - segmentW) <= 0.5) {
      return;
    }

    setSegmentW(width);
  };

  /* ---------------------------------------------------------------------- */
  /* Segment pill                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (segmentW <= 0) {
      return;
    }

    const pad = 4;

    const buttonWidth = (segmentW - pad * 3) / 2;

    const start = pad;

    const end = pad * 2 + buttonWidth;

    const targetX =
      filter === 'current'
        ? isRTL
          ? end
          : start
        : isRTL
          ? start
          : end;

    pillW.value = buttonWidth;

    if (!pillReady.current) {
      pillX.value = targetX;
      pillReady.current = true;
      return;
    }

    pillX.value = withSpring(targetX, TAB_SPRING);
  }, [filter, segmentW, isRTL, pillX, pillW]);

  const pillStyle = useAnimatedStyle(() => ({
    width: pillW.value,
    transform: [{ translateX: pillX.value }],
  }));

  /* ---------------------------------------------------------------------- */
  /* Content animation                                                      */
  /* ---------------------------------------------------------------------- */

  const paneStyle = useAnimatedStyle(() => ({
    opacity: pane.value,

    transform: [
      {
        translateX:
          (1 - pane.value) * TAB_SLIDE * paneDirection.value,
      },
    ],
  }));

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 24,
        },
      ]}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}

      <Text style={styles.title}>
        {t('orders.title')}
      </Text>

      {/* ---------------------------------------------------------------- */}
      {/* Current / Previous segment                                       */}
      {/* ---------------------------------------------------------------- */}

      <View
        onLayout={onSegmentLayout}
        style={styles.segment}
      >
        {segmentW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.segPill,
              pillStyle,
            ]}
          />
        ) : null}

        {filters.map((f) => {
          const active = filter === f.id;

          return (
            <Pressable
              key={f.id}
              onPress={() => selectFilter(f.id)}
              style={styles.segBtn}
            >
              <Text
                style={[
                  styles.segLabel,
                  active && styles.segLabelActive,
                ]}
              >
                {f.label}
              </Text>

              {f.count > 0 ? (
                <View
                  style={[
                    styles.segCount,
                    active && styles.segCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segCountText,
                      active && styles.segCountTextActive,
                    ]}
                  >
                    {f.count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* Body                                                              */}
      {/* ---------------------------------------------------------------- */}

      <View style={styles.body}>
        <Animated.View
          style={[
            styles.body,
            paneStyle,
          ]}
        >
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
              style={styles.body}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {filter === 'current'
                ? list.map((order) => (
                    <CurrentOrderCard
                      key={order.id}
                      order={order}
                      locale={locale}
                      onTrack={onTrack}
                    />
                  ))
                : list.map((order) => (
                    <PreviousOrderRow
                      key={order.id}
                      order={order}
                      locale={locale}
                      onReorder={onReorder}
                    />
                  ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Current Order Card                                                         */
/* -------------------------------------------------------------------------- */

function CurrentOrderCard({
  order,
  locale,
  onTrack,
}: {
  order: Order;
  locale: string;
  onTrack?: (order: Order) => void;
}) {
  const { t } = useTranslation();

  const fill = useSharedValue(0);

  const hasAnimated = useRef(false);

  useEffect(() => {
    const target = progressFraction(order.status);

    const animation = withTiming(target, {
      duration: hasAnimated.current ? 500 : 800,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });

    fill.value = animation;

    hasAnimated.current = true;
  }, [fill, order.status]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <AnimatedOrderCard>
      <View style={styles.activeCard}>
        {/* -------------------------------------------------------------- */}
        {/* Top                                                            */}
        {/* -------------------------------------------------------------- */}

        <View style={styles.activeTop}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {t(statusLabelKey(order.status))}
            </Text>
          </View>

          <Text style={styles.code}>
            {order.orderCode}
          </Text>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* Order information                                             */}
        {/* -------------------------------------------------------------- */}

        <Text style={styles.activeTitle}>
          {itemSummary(order, locale)}
        </Text>

        <Text style={styles.activeMeta}>
          {t('orders.readyAround', {
            time: order.readyAround ?? '—',
            total: moneyFixed(order.total),
          })}
        </Text>

        {/* -------------------------------------------------------------- */}
        {/* Progress                                                        */}
        {/* -------------------------------------------------------------- */}

        <View style={styles.progressBlock}>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.trackFill,
                fillStyle,
              ]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text
              style={[
                styles.step,
                progressStepActive(order.status, 0) &&
                  styles.stepActive,
              ]}
            >
              {t('confirmation.received')}
            </Text>

            <Text
              style={[
                styles.step,
                styles.stepCenter,
                progressStepActive(order.status, 1) &&
                  styles.stepActive,
              ]}
            >
              {t('confirmation.preparing')}
            </Text>

            <Text
              style={[
                styles.step,
                styles.stepCenter,
                progressStepActive(order.status, 2) &&
                  styles.stepActive,
              ]}
            >
              {t('confirmation.ready')}
            </Text>

            <Text
              style={[
                styles.step,
                styles.stepEnd,
                progressStepActive(order.status, 3) &&
                  styles.stepActive,
              ]}
            >
              {t('orders.status.completed')}
            </Text>
          </View>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* Track button                                                    */}
        {/* -------------------------------------------------------------- */}

        <Button
          label={t('orders.trackOrder')}
          onPress={() => onTrack?.(order)}
          style={styles.trackBtn}
        />
      </View>
    </AnimatedOrderCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Previous Order Row                                                         */
/* -------------------------------------------------------------------------- */

function PreviousOrderRow({
  order,
  locale,
  onReorder,
}: {
  order: Order;
  locale: string;
  onReorder?: (order: Order) => void;
}) {
  const { t } = useTranslation();

  const thumb = order.items[0]?.image;

  return (
    <AnimatedOrderCard>
      <View style={styles.pastRow}>
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
    </AnimatedOrderCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = createStyles((colors) => ({
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

  /* ---------------------------------------------------------------------- */
  /* Segment                                                                */
  /* ---------------------------------------------------------------------- */

  segment: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    gap: 4,
    position: 'relative',
  },

  segPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  segBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 1,
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

  segCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },

  segCountActive: {
    backgroundColor: colors.badgeBg,
  },

  segCountText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.sub,
  },

  segCountTextActive: {
    color: colors.badgeText,
  },

  /* ---------------------------------------------------------------------- */
  /* Body                                                                   */
  /* ---------------------------------------------------------------------- */

  body: {
    flex: 1,
    overflow: 'hidden',
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

  /* ---------------------------------------------------------------------- */
  /* Current order                                                          */
  /* ---------------------------------------------------------------------- */

  activeCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },

  statusPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
    maxWidth: '70%',
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

  /* ---------------------------------------------------------------------- */
  /* Progress                                                               */
  /* ---------------------------------------------------------------------- */

  progressBlock: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },

  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  trackFill: {
    width: '0%',
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.price,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  step: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },

  stepCenter: {
    textAlign: 'center',
  },

  stepEnd: {
    textAlign: 'right',
  },

  stepActive: {
    color: colors.ink,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
  },

  trackBtn: {
    height: 44,
  },

  /* ---------------------------------------------------------------------- */
  /* Previous orders                                                        */
  /* ---------------------------------------------------------------------- */

  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 1,
    },
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

  pastCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },

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
    flexShrink: 0,
  },

  reorderText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
}));