import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  Dimensions,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  BackButton,
  Button,
  QtyStepper,
  Text,
  StateMessage,
} from '@/components/ui';
import { CartIconButton } from '@/components/menu/CartIconButton';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { useMenuItem, type ModifierChoice } from '@/core/catalog';
import { useStoreAvailability } from '@/core/settings';
import { localized } from '@/utils/localized';
import { money } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import {
  CHIP_GAP,
  itemChipLockStyle,
  itemColumnStyle,
  itemHeroMaxHeight,
  itemLayoutFromWidth,
} from './itemLayout';

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

const heroEnter = FadeInDown.duration(250)
  .easing(motionEase)
  .reduceMotion(ReduceMotion.System)
  .withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] });

const detailsEnter = (delay: number) =>
  FadeInDown.duration(220)
    .delay(delay)
    .easing(motionEase)
    .reduceMotion(ReduceMotion.System)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 6 }] });

const initialWindow = Dimensions.get('window');

interface ItemScreenProps {
  itemId: string;
  cartCount?: number;
  onBack?: () => void;
  onOpenCart?: () => void;
  onAdded?: () => void;
  onAdd: (payload: {
    quantity: number;
    unitPrice: number;
    optionsSummary: string;
    optionsSummary_arabic: string;
    selectedOptionIds: string[];
    specialInstructions: string;
  }) => void;
}

export const ItemScreen = ({
  itemId,
  cartCount = 0,
  onBack,
  onOpenCart,
  onAdded,
  onAdd,
}: ItemScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [availableWidth, setAvailableWidth] = useState(initialWindow.width);
  const [frameHeight, setFrameHeight] = useState(initialWindow.height);
  const availableWidthRef = useRef(initialWindow.width);
  const frameHeightRef = useRef(initialWindow.height);
  const didLayoutRef = useRef(false);
  const layout = itemLayoutFromWidth(
    availableWidth > 0 ? availableWidth : initialWindow.width,
  );
  const heroHeight = itemHeroMaxHeight(
    frameHeight > 0 ? frameHeight : initialWindow.height,
    layout,
  );
  const chipLock = itemChipLockStyle(layout.chipWidth);
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { item, isLoading, errorCode, error } = useMenuItem(itemId);
  const { isClosed } = useStoreAvailability();
  const [qty, setQty] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const breadGroup = item?.modifiers?.find((g) => g.type === 'single');
  const extrasGroup = item?.modifiers?.find((g) => g.type === 'multi');

  const [breadId, setBreadId] = useState('');
  const [extraIds, setExtraIds] = useState<string[]>([]);

  useEffect(() => {
    setBreadId(breadGroup?.options[0]?.id ?? '');
    setExtraIds(extrasGroup?.options[0] ? [extrasGroup.options[0].id] : []);
    setSpecialInstructions('');
    setQty(1);
  }, [item?.id, breadGroup?.options, extrasGroup?.options]);

  useEffect(() => {
    setImageFailed(false);
  }, [item?.image]);

  const scrollRef = useRef<ScrollView>(null);
  const notesAnchorRef = useRef<View>(null);
  const footerRef = useRef<View>(null);
  const notesFocusedRef = useRef(false);
  const keyboardTopRef = useRef(0);
  const scrollYRef = useRef(0);

  const ensureNotesVisible = () => {
    const notes = notesAnchorRef.current;
    const keyboardTop = keyboardTopRef.current;
    if (!notes || keyboardTop <= 0) return;

    notes.measureInWindow((_x, y, _w, h) => {
      const fieldBottom = y + h + spacing.md;
      const reveal = (occludedTop: number) => {
        const overlap = fieldBottom - occludedTop;
        if (overlap <= 0) return;
        scrollRef.current?.scrollTo({
          y: Math.max(0, scrollYRef.current + overlap),
          animated: true,
        });
      };

      const footer = footerRef.current;
      if (!footer) {
        reveal(keyboardTop);
        return;
      }
      footer.measureInWindow((_fx, fy) => {
        reveal(Math.min(fy, keyboardTop));
      });
    });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      if (notesFocusedRef.current) {
        requestAnimationFrame(ensureNotesVisible);
      }
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = 0;
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const selectedChoices = useMemo(() => {
    const list: ModifierChoice[] = [];
    breadGroup?.options.forEach((o) => {
      if (o.id === breadId) list.push(o);
    });
    extrasGroup?.options.forEach((o) => {
      if (extraIds.includes(o.id)) list.push(o);
    });
    return list;
  }, [breadGroup, extrasGroup, breadId, extraIds]);

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    const extras = selectedChoices.reduce((sum, c) => sum + c.price, 0);
    return item.price + extras;
  }, [item, selectedChoices]);

  const optionsSummary = selectedChoices.map((c) => c.label).join(' · ');
  const optionsSummary_arabic = selectedChoices
    .map((c) => c.label_arabic)
    .join(' · ');

  const onRootLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0) return;

    const widthChanged = Math.abs(width - availableWidthRef.current) > 0.5;
    if (!didLayoutRef.current) {
      didLayoutRef.current = true;
      availableWidthRef.current = width;
      setAvailableWidth(width);
      if (height > 0) {
        frameHeightRef.current = height;
        setFrameHeight(height);
      }
      return;
    }

    if (!widthChanged) return;

    availableWidthRef.current = width;
    setAvailableWidth(width);
    if (height > 0) {
      frameHeightRef.current = height;
      setFrameHeight(height);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.missing]} onLayout={onRootLayout}>
        <StateMessage loading />
      </View>
    );
  }

  if (errorCode || !item) {
    return (
      <View style={[styles.root, styles.missing]} onLayout={onRootLayout}>
        <StateMessage
          errorCode={errorCode ?? 'not_found'}
          error={error}
          secondaryLabel={t('item.goBack')}
          onSecondary={onBack}
        />
      </View>
    );
  }

  const toggleExtra = (id: string) => {
    setExtraIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const badge = localized(locale, item.badge ?? '', item.badge_arabic);
  const showImage = Boolean(item.image) && !imageFailed;

  return (
    <View style={styles.root} onLayout={onRootLayout}>
      <View style={[styles.column, itemColumnStyle(layout.columnWidth)]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: layout.paddingX,
          },
        ]}
      >
        <BackButton onPress={onBack} />
        <CartIconButton
          tone="light"
          count={cartCount}
          onPress={onOpenCart}
          accessibilityLabel={t('menu.viewCart')}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        enabled={Platform.OS !== 'web'}
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          scrollEventThrottle={16}
          onScroll={(event) => {
            scrollYRef.current = event.nativeEvent.contentOffset.y;
          }}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            entering={Platform.OS === 'web' ? undefined : heroEnter}
            style={[styles.heroCard, { marginHorizontal: layout.paddingX }]}
          >
            <View
              style={[
                styles.hero,
                {
                  height: heroHeight,
                  maxHeight: heroHeight,
                },
              ]}
            >
              {showImage ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Ionicons name="image-outline" size={48} color={colors.muted} />
                </View>
              )}
            </View>
          </Animated.View>

          <View
            style={[
              styles.details,
              {
                paddingHorizontal: layout.paddingX,
                gap: layout.sectionGap,
              },
            ]}
          >
            <Animated.View
              entering={Platform.OS === 'web' ? undefined : detailsEnter(50)}
              style={styles.meta}
            >
              <View style={styles.metaRow}>
                {item.badge && item.badge !== 'combo' ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {badge}
                    </Text>
                  </View>
                ) : null}
                {item.calories ? (
                  <Text style={styles.cal}>
                    {t('item.cal', { count: item.calories })}
                  </Text>
                ) : null}
              </View>
              <View style={styles.titleRow}>
                <Text style={[styles.name, { fontSize: layout.titleSize }]}>
                  {localized(locale, item.name, item.name_arabic)}
                </Text>
                <Text style={styles.price}>{money(item.price)}</Text>
              </View>
              <Text style={styles.desc}>
                {localized(
                  locale,
                  item.longDescription ?? item.description,
                  item.longDescription_arabic ?? item.description_arabic,
                )}
              </Text>
            </Animated.View>

            {breadGroup || extrasGroup ? (
            <Animated.View
              entering={
                Platform.OS === 'web' ? undefined : detailsEnter(110)
              }
              style={[styles.modifiers, { gap: layout.sectionGap }]}
            >
            {breadGroup ? (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>
                    {localized(locale, breadGroup.label, breadGroup.label_arabic)}
                  </Text>
                  <Text style={styles.required}>{t('common.required')}</Text>
                </View>
                <View
                  style={styles.choiceRow}
                  accessibilityRole="radiogroup"
                >
                  {breadGroup.options.map((opt) => {
                    const active = opt.id === breadId;
                    return (
                      <ChoiceChip
                        key={opt.id}
                        active={active}
                        label={localized(locale, opt.label, opt.label_arabic)}
                        hint={
                          localized(
                            locale,
                            opt.hint ?? '',
                            opt.hint_arabic,
                          ) ||
                          (opt.price
                            ? t('item.optionSurcharge', {
                                price: money(opt.price),
                              })
                            : t('item.included'))
                        }
                        onPress={() => setBreadId(opt.id)}
                        lockStyle={chipLock}
                        padding={layout.chipPadding}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}

            {extrasGroup ? (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>
                    {localized(
                      locale,
                      extrasGroup.label,
                      extrasGroup.label_arabic,
                    )}
                  </Text>
                  <Text style={styles.optional}>{t('common.optional')}</Text>
                </View>
                <View style={styles.extraList}>
                  {extrasGroup.options.map((opt) => {
                    const active = extraIds.includes(opt.id);
                    return (
                      <ExtraRow
                        key={opt.id}
                        active={active}
                        label={localized(locale, opt.label, opt.label_arabic)}
                        price={`+${money(opt.price)}`}
                        onPress={() => toggleExtra(opt.id)}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}
            </Animated.View>
            ) : null}

            <View ref={notesAnchorRef} collapsable={false} style={styles.notesAnchor}>
            <Animated.View
              entering={
                Platform.OS === 'web' ? undefined : detailsEnter(170)
              }
              style={styles.section}
            >
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>
                  {t('item.specialInstructions')}
                </Text>
                <Text style={styles.optional}>{t('common.optional')}</Text>
              </View>
              <NotesField
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder={t('item.specialInstructionsPlaceholder')}
                placeholderColor={colors.muted}
                accessibilityLabel={t('item.specialInstructions')}
                onFocus={() => {
                  notesFocusedRef.current = true;
                  requestAnimationFrame(ensureNotesVisible);
                }}
                onBlur={() => {
                  notesFocusedRef.current = false;
                }}
              />
            </Animated.View>
            </View>
          </View>
        </ScrollView>

        <View
          ref={footerRef}
          collapsable={false}
          style={[
            styles.footer,
            {
              gap: layout.footerGap,
              paddingHorizontal: layout.paddingX,
              paddingTop: layout.footerPadY,
              paddingBottom: Math.max(insets.bottom, layout.footerPadY),
            },
          ]}
        >
          {isClosed ? (
            <View style={styles.closedWrap}>
              <StoreClosedBanner compact />
            </View>
          ) : (
            <>
              <View style={styles.qtyWrap}>
                <QtyStepper
                  value={qty}
                  onChange={setQty}
                  min={1}
                  size={layout.qtySize}
                />
              </View>
              <Button
                label={t('item.addToCart', { price: money(unitPrice * qty) })}
                style={[
                  styles.cta,
                  layout.breakpoint === 'xs' && styles.ctaNarrow,
                ]}
                onPress={() => {
                  onAdd({
                    quantity: qty,
                    unitPrice,
                    optionsSummary,
                    optionsSummary_arabic,
                    selectedOptionIds: selectedChoices.map((c) => c.id),
                    specialInstructions: specialInstructions.trim(),
                  });
                  onAdded?.();
                }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      </View>
    </View>
  );
};

type ChoiceChipProps = {
  active: boolean;
  label: string;
  hint: string;
  onPress: () => void;
  lockStyle: ViewStyle;
  padding: number;
};

function ChoiceChip({
  active,
  label,
  hint,
  onPress,
  lockStyle,
  padding,
}: ChoiceChipProps) {
  const { colors } = useTheme();
  const selected = useSharedValue(active ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    selected.value = withTiming(active ? 1 : 0, MOTION);
  }, [active, selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
    backgroundColor: interpolateColor(
      selected.value,
      [0, 1],
      [colors.card, colors.selBg],
    ),
    borderColor: interpolateColor(
      selected.value,
      [0, 1],
      [colors.border, colors.selBg],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selected.value,
      [0, 1],
      [colors.sub, colors.selText],
    ),
  }));

  const hintStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selected.value,
      [0, 1],
      [colors.muted, colors.selText],
    ),
    opacity: interpolate(selected.value, [0, 1], [1, 0.65]),
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, PRESS_IN);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, MOTION);
      }}
      style={[styles.choiceCard, lockStyle]}
    >
      <Animated.View
        style={[
          styles.choiceCardInner,
          { paddingVertical: padding, paddingHorizontal: padding },
          cardStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.choiceLabel,
            active && styles.choiceLabelActive,
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
        <Animated.Text
          style={[styles.choiceHint, active && styles.choiceHintActive, hintStyle]}
        >
          {hint}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

type ExtraRowProps = {
  active: boolean;
  label: string;
  price: string;
  onPress: () => void;
};

function ExtraRow({ active, label, price, onPress }: ExtraRowProps) {
  const { colors } = useTheme();
  const selected = useSharedValue(active ? 1 : 0);
  const checkScale = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    selected.value = withTiming(active ? 1 : 0, MOTION);
    checkScale.value = withTiming(active ? 1 : 0, MOTION);
  }, [active, checkScale, selected]);

  const rowStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      selected.value,
      [0, 1],
      [colors.card, colors.primary],
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selected.value,
      [0, 1],
      [colors.card, colors.checkBg],
    ),
    borderColor: interpolateColor(
      selected.value,
      [0, 1],
      [colors.border, colors.checkBg],
    ),
  }));

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={styles.extraPress}
    >
      <Animated.View style={[styles.extraRow, rowStyle]}>
        <Animated.View style={[styles.check, checkStyle]}>
          <Animated.Text style={[styles.checkMark, markStyle]}>✓</Animated.Text>
        </Animated.View>
        <Text style={[styles.extraLabel, !active && styles.extraLabelOff]}>
          {label}
        </Text>
        <Text style={styles.extraPrice}>{price}</Text>
      </Animated.View>
    </Pressable>
  );
}

function NotesField({
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  accessibilityLabel,
  onFocus,
  onBlur,
}: {
  value: string;
  onChangeText: (next: string) => void;
  placeholder: string;
  placeholderColor: string;
  accessibilityLabel: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { colors } = useTheme();
  const focused = useSharedValue(0);

  const wrapStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focused.value,
      [0, 1],
      [colors.card, colors.primary],
    ),
  }));

  return (
    <Animated.View style={[styles.noteWrap, wrapStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        multiline
        maxLength={200}
        textAlignVertical="top"
        accessibilityLabel={accessibilityLabel}
        onFocus={() => {
          focused.value = withTiming(1, MOTION);
          onFocus?.();
        }}
        onBlur={() => {
          focused.value = withTiming(0, MOTION);
          onBlur?.();
        }}
        style={[
          styles.noteInput,
          value ? styles.noteInputFilled : styles.noteInputEmpty,
        ]}
      />
    </Animated.View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: colors.sheetBg,
  },
  column: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  missing: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  header: {
    flexShrink: 0,
    minWidth: 0,
    alignSelf: 'stretch',
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sheetBg,
    zIndex: 1,
  },
  body: { flex: 1, minWidth: 0, minHeight: 0, alignSelf: 'stretch' },
  scroll: { flex: 1, minWidth: 0, minHeight: 0, alignSelf: 'stretch' },
  scrollContent: {
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    alignSelf: 'stretch',
    minHeight: 0,
    marginTop: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  hero: {
    alignSelf: 'stretch',
    minWidth: 0,
    minHeight: 0,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.placeholder,
  },
  details: {
    alignSelf: 'stretch',
    minWidth: 0,
    paddingTop: spacing.lg,
  },
  modifiers: { gap: spacing.md, minWidth: 0 },
  meta: { gap: spacing.xs, minWidth: 0 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minWidth: 0,
  },
  badge: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '70%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  cal: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    minWidth: 0,
    maxWidth: '100%',
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.ink,
  },
  price: {
    flexShrink: 0,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.price,
  },
  desc: {
    minWidth: 0,
    alignSelf: 'stretch',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.md,
    lineHeight: 20,
    color: colors.sub,
  },
  section: { gap: spacing.sm, minWidth: 0 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minWidth: 0,
  },
  sectionTitle: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  required: {
    flexShrink: 0,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.label,
  },
  optional: {
    flexShrink: 0,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.label,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CHIP_GAP,
    alignSelf: 'stretch',
    minWidth: 0,
  },
  choiceCard: {
    minWidth: 0,
    overflow: 'hidden',
  },
  choiceCardInner: {
    width: '100%',
    minWidth: 0,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  choiceLabel: {
    minWidth: 0,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  choiceLabelActive: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.selText,
  },
  choiceHint: {
    minWidth: 0,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  choiceHintActive: {
    color: colors.selText,
    opacity: 0.65,
  },
  extraList: { gap: spacing.sm, minWidth: 0 },
  extraPress: {
    alignSelf: 'stretch',
    minWidth: 0,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.card,
    minWidth: 0,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  check: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.checkText,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 16,
  },
  extraLabel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  extraLabelOff: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  extraPrice: {
    flexShrink: 0,
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  notesAnchor: {
    alignSelf: 'stretch',
    minWidth: 0,
  },
  noteWrap: {
    alignSelf: 'stretch',
    minWidth: 0,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.card,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  noteInput: {
    alignSelf: 'stretch',
    minWidth: 0,
    minHeight: 88,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: typography.fontSize.base,
    lineHeight: 20,
    color: colors.ink,
  },
  noteInputFilled: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
  },
  noteInputEmpty: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight.regular,
  },
  footer: {
    flexShrink: 0,
    minWidth: 0,
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.sheetBg,
  },
  closedWrap: {
    flexGrow: 1,
    minWidth: 0,
  },
  qtyWrap: { flexShrink: 0 },
  cta: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 56,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
  },
  ctaNarrow: {
    height: 48,
    paddingHorizontal: spacing.sm,
  },
}));
