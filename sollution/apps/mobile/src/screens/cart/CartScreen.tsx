import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  ReduceMotion,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BackButton, Button, QtyStepper, Text } from '@/components/ui';
import { EmptyCartIllustration } from '@/components/cart/EmptyCartIllustration';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { useStoreAvailability } from '@/core/settings';
import { localized } from '@/utils/localized';
import { money, moneyFixed } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import type { CartLine } from '@/types/cart';
import {
  radii,
  typography,
  createStyles,
  useTheme,
} from '@/theme';
import { cartLayoutFromWidth, type CartLayout } from './cartLayout';

const initialWindow = Dimensions.get('window');

const motionEase = Easing.out(Easing.cubic);
const MOTION = {
  duration: 200,
  easing: motionEase,
  reduceMotion: ReduceMotion.System,
} as const;
const PRESS_IN = {
  duration: 90,
  easing: motionEase,
  reduceMotion: ReduceMotion.System,
} as const;

const SWIPE_OUT = {
  duration: 500,
  easing: Easing.inOut(Easing.cubic),
  reduceMotion: ReduceMotion.System,
} as const;

interface CartScreenProps {
  items: CartLine[];
  subtotal: number;
  vat: number;
  total: number;
  onBack?: () => void;
  onChangeQty: (lineId: string, qty: number) => void;
  onAddMore?: () => void;
  onContinue?: () => void;
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
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { isClosed } = useStoreAvailability();
  const [availableWidth, setAvailableWidth] = useState(initialWindow.width);
  const availableWidthRef = useRef(initialWindow.width);
  const layout = cartLayoutFromWidth(
    availableWidth > 0 ? availableWidth : initialWindow.width,
  );

  const onRootLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width <= 0) return;
    if (Math.abs(width - availableWidthRef.current) <= 0.5) return;
    availableWidthRef.current = width;
    setAvailableWidth(width);
  };

  const empty = items.length === 0;
  const ctaScale = useSharedValue(1);
  const skipCtaMotion = useRef(true);

  useEffect(() => {
    if (skipCtaMotion.current) {
      skipCtaMotion.current = false;
      return;
    }
    if (empty || isClosed) return;
    ctaScale.value = withSequence(
      withTiming(1.04, { ...MOTION, duration: 80 }),
      withTiming(1, { ...MOTION, duration: 140 }),
    );
  }, [ctaScale, empty, isClosed, total]);

  const ctaMotionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      onLayout={onRootLayout}
    >
      <View style={[styles.header, { paddingHorizontal: layout.paddingX }]}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { fontSize: layout.titleSize }]}>
          {t('cart.title')}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {empty ? (
        <EmptyCartState
          layout={layout}
          onBrowse={onAddMore}
          title={t('cart.empty')}
          browseLabel={t('cart.browseMenu')}
        />
      ) : (
        <>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.list,
              {
                paddingHorizontal: layout.paddingX,
                gap: layout.listGap,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: layout.itemGap }}>
              {items.map((line) => (
                <CartItem
                  key={line.id}
                  line={line}
                  locale={locale}
                  layout={layout}
                  swipeOnRemove={items.length > 1}
                  onChangeQty={onChangeQty}
                  onOpenItem={onOpenItem}
                />
              ))}
            </View>

            <AddMoreBar
              layout={layout}
              label={t('cart.addMore')}
              onPress={onAddMore}
            />

            <CartSummary
              layout={layout}
              subtotal={subtotal}
              vat={vat}
              total={total}
              subtotalLabel={t('cart.subtotal')}
              vatLabel={t('cart.vat')}
              totalLabel={t('cart.total')}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingHorizontal: layout.paddingX,
                paddingTop: layout.footerPadY,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            {isClosed ? <StoreClosedBanner compact /> : null}

            <Animated.View style={ctaMotionStyle}>
              <Button
                label={
                  isClosed
                    ? t('store.closedCta')
                    : t('cart.continue', {
                        total: moneyFixed(total),
                      })
                }
                onPress={onContinue}
                disabled={isClosed}
              />
            </Animated.View>
          </View>
        </>
      )}
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty cart                                                                 */
/* -------------------------------------------------------------------------- */

interface EmptyCartStateProps {
  layout: CartLayout;
  title: string;
  browseLabel: string;
  onBrowse?: () => void;
}

const EmptyCartState = ({
  layout,
  title,
  browseLabel,
  onBrowse,
}: EmptyCartStateProps) => {
  return (
    <View style={[styles.empty, { paddingHorizontal: layout.paddingX }]}>
      <EmptyCartIllustration size={layout.emptyArt} />

      <Text
        style={[
          styles.emptyTitle,
          {
            fontSize: layout.emptyTitle,
            maxWidth: layout.emptyMaxWidth,
          },
        ]}
      >
        {title}
      </Text>

      <Button
        label={browseLabel}
        onPress={onBrowse}
        style={styles.emptyAction}
      />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Add more                                                                   */
/* -------------------------------------------------------------------------- */

interface AddMoreBarProps {
  layout: CartLayout;
  label: string;
  onPress?: () => void;
}

const AddMoreBar = ({ layout, label, onPress }: AddMoreBarProps) => {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);

  const motionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
    backgroundColor: interpolateColor(
      pressed.value,
      [0, 1],
      ['transparent', colors.surface],
    ),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, PRESS_IN);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, MOTION);
      }}
    >
      <Animated.View
        style={[
          styles.addMore,
          { minHeight: layout.addMoreMinHeight },
          motionStyle,
        ]}
      >
        <Text style={[styles.addMorePlus, { fontSize: layout.addMorePlus }]}>
          +
        </Text>
        <Text style={[styles.addMoreText, { fontSize: layout.addMoreText }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/* -------------------------------------------------------------------------- */
/* Cart item                                                                  */
/* -------------------------------------------------------------------------- */

interface CartItemProps {
  line: CartLine;
  locale: string;
  layout: CartLayout;
  swipeOnRemove: boolean;
  onChangeQty: (lineId: string, qty: number) => void;
  onOpenItem?: (menuItemId: string) => void;
}

const CartItem = ({
  line,
  locale,
  layout,
  swipeOnRemove,
  onChangeQty,
  onOpenItem,
}: CartItemProps) => {
  const pressed = useSharedValue(0);
  const shift = useSharedValue(0);
  const slotHeight = useSharedValue(-1);
  const [removing, setRemoving] = useState(false);
  const size = useRef({ width: 0, height: 0 });

  const removeLine = useCallback(() => {
    onChangeQty(line.id, 0);
  }, [line.id, onChangeQty]);

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
  }));

  const slotStyle = useAnimatedStyle(() =>
    slotHeight.value < 0 ? {} : { height: slotHeight.value },
  );

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value }],
  }));

  const changeQty = (quantity: number) => {
    if (removing) return;
    if (quantity > 0 || !swipeOnRemove) {
      onChangeQty(line.id, quantity);
      return;
    }

    setRemoving(true);
    const width = size.current.width || 360;
    const height = size.current.height || 96;
    slotHeight.value = height;
    shift.value = withTiming(-width, SWIPE_OUT);
    slotHeight.value = withDelay(
      480,
      withTiming(0, MOTION, (finished) => {
        if (finished) runOnJS(removeLine)();
      }),
    );
  };

  return (
    <Animated.View
      style={[styles.lineSlot, removing && styles.lineSlotClip, slotStyle]}
      onLayout={(event) => {
        if (removing) return;
        size.current = {
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        };
      }}
    >
      <Animated.View
        style={[
          styles.row,
          slideStyle,
          {
            gap: layout.rowGap,
            padding: layout.rowPad,
          },
        ]}
        pointerEvents={removing ? 'none' : 'auto'}
      >
        <Pressable
          style={styles.rowMain}
          onPress={() => onOpenItem?.(line.menuItemId)}
          disabled={!onOpenItem}
          onPressIn={() => {
            pressed.value = withTiming(1, PRESS_IN);
          }}
          onPressOut={() => {
            pressed.value = withTiming(0, MOTION);
          }}
        >
          <Animated.View
            style={[
              styles.rowMainInner,
              mainStyle,
              { gap: layout.rowGap },
            ]}
          >
          <Image
            source={{ uri: line.image }}
            style={[
              styles.thumb,
              {
                width: layout.thumbSize,
                height: layout.thumbSize,
              },
            ]}
          />

          <View style={styles.rowCopy}>
            <Text style={[styles.itemName, { fontSize: layout.nameSize }]}>
              {localized(
                locale,
                line.name,
                line.name_arabic,
              )}
            </Text>

            {line.optionsSummary ? (
              <Text
                style={[styles.itemOpts, { fontSize: layout.optsSize }]}
                numberOfLines={2}
              >
                {localized(
                  locale,
                  line.optionsSummary,
                  line.optionsSummary_arabic,
                )}
              </Text>
            ) : null}

            {line.specialInstructions ? (
              <Text
                style={[styles.itemNote, { fontSize: layout.optsSize }]}
                numberOfLines={2}
              >
                {line.specialInstructions}
              </Text>
            ) : null}

            <Text style={[styles.itemPrice, { fontSize: layout.priceSize }]}>
              {money(line.unitPrice * line.quantity)}
            </Text>
          </View>
          </Animated.View>
        </Pressable>

        <View style={styles.qtyWrap}>
          <QtyStepper
            size={layout.qtySize}
            value={line.quantity}
            onChange={changeQty}
            min={0}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/* Cart summary                                                               */
/* -------------------------------------------------------------------------- */

interface CartSummaryProps {
  layout: CartLayout;
  subtotal: number;
  vat: number;
  total: number;
  subtotalLabel: string;
  vatLabel: string;
  totalLabel: string;
}

const CartSummary = ({
  layout,
  subtotal,
  vat,
  total,
  subtotalLabel,
  vatLabel,
  totalLabel,
}: CartSummaryProps) => {
  return (
    <View
      style={[
        styles.totals,
        {
          paddingVertical: layout.summaryPadY,
          paddingHorizontal: layout.summaryPadX,
        },
      ]}
    >
      <SummaryRow
        layout={layout}
        label={subtotalLabel}
        value={moneyFixed(subtotal)}
      />

      <SummaryRow
        layout={layout}
        label={vatLabel}
        value={moneyFixed(vat)}
      />

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={[styles.totalStrong, { fontSize: layout.summaryTotal }]}>
          {totalLabel}
        </Text>

        <Text style={[styles.totalStrong, { fontSize: layout.summaryTotal }]}>
          {moneyFixed(total)}
        </Text>
      </View>
    </View>
  );
};

interface SummaryRowProps {
  layout: CartLayout;
  label: string;
  value: string;
}

const SummaryRow = ({ layout, label, value }: SummaryRowProps) => {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, { fontSize: layout.summaryLabel }]}>
        {label}
      </Text>
      <Text style={[styles.totalLabel, { fontSize: layout.summaryLabel }]}>
        {value}
      </Text>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
    color: colors.ink,
  },

  headerSpacer: {
    width: 40,
  },

  /* Empty state */
  empty: {
    flex: 1,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  emptyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyAction: {
    marginTop: 8,
    minWidth: 180,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },

  /* Scroll content */
  list: {
    paddingTop: 18,
    paddingBottom: 20,
  },

  lineSlot: {
    width: '100%',
  },

  lineSlotClip: {
    overflow: 'hidden',
  },

  /* Cart item */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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

  rowMain: {
    flex: 1,
    minWidth: 0,
  },

  rowMainInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
  },

  thumb: {
    flexShrink: 0,
    borderRadius: radii.md,
    backgroundColor: colors.placeholder,
  },

  qtyWrap: {
    flexShrink: 0,
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  itemName: {
    minWidth: 0,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },

  itemOpts: {
    minWidth: 0,
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },

  itemNote: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
    fontStyle: 'italic',
    color: colors.muted,
  },

  itemPrice: {
    marginTop: 5,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.price,
  },

  /* Add more */
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },

  addMorePlus: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },

  addMoreText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },

  /* Summary */
  totals: {
    marginTop: 4,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    gap: 8,

    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.07,
    shadowRadius: 5,

    elevation: 2,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },

  totalStrong: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },

  /* Footer */
  footer: {
    gap: 10,
  },
}));