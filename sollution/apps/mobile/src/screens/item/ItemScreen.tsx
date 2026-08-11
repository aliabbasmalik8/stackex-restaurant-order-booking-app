import { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, QtyStepper, Text, StateMessage } from '@/components/ui';
import { CartIconButton } from '@/components/menu/CartIconButton';
import { useMenuItem, type ModifierChoice } from '@/modules/catalog';
import { localized } from '@/utils/localized';
import { money } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import { colors, radii, typography } from '@/theme';

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
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { item, isLoading, errorCode } = useMenuItem(itemId);
  const [qty, setQty] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

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

  if (isLoading) {
    return (
      <View style={[styles.root, styles.missing]}>
        <StateMessage loading />
      </View>
    );
  }

  if (errorCode || !item) {
    return (
      <View style={[styles.root, styles.missing]}>
        <StateMessage
          errorCode={errorCode ?? 'not_found'}
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

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.imageRing}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
      </View>

      <View
        style={[styles.topBar, { top: insets.top + 12 }]}
        pointerEvents="box-none"
      >
        <Pressable onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <CartIconButton
          tone="light"
          count={cartCount}
          onPress={onOpenCart}
          accessibilityLabel={t('menu.viewCart')}
        />
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetBody}
        >
          <View style={styles.meta}>
            <View style={styles.metaRow}>
              {item.badge && item.badge !== 'combo' ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🔥 {item.badge}</Text>
                </View>
              ) : null}
              {item.calories ? (
                <Text style={styles.cal}>{t('item.cal', { count: item.calories })}</Text>
              ) : null}
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.name}>
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
          </View>

          {breadGroup ? (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>
                  {localized(locale, breadGroup.label, breadGroup.label_arabic)}
                </Text>
                <Text style={styles.required}>{t('common.required')}</Text>
              </View>
              <View style={styles.choiceRow}>
                {breadGroup.options.map((opt) => {
                  const active = opt.id === breadId;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => setBreadId(opt.id)}
                      style={[
                        styles.choiceCard,
                        active ? styles.choiceActive : styles.choiceIdle,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceLabel,
                          active && styles.choiceLabelActive,
                        ]}
                      >
                        {localized(locale, opt.label, opt.label_arabic)}
                      </Text>
                      <Text
                        style={[
                          styles.choiceHint,
                          active && styles.choiceHintActive,
                        ]}
                      >
                        {localized(
                          locale,
                          opt.hint ??
                            (opt.price ? `+${money(opt.price)}` : 'included'),
                          opt.hint_arabic ??
                            (opt.price ? `+${opt.price} درهم` : 'مشمول'),
                        )}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={opt.id}
                      onPress={() => toggleExtra(opt.id)}
                      style={styles.extraRow}
                    >
                      <View
                        style={[styles.check, active && styles.checkOn]}
                      >
                        {active ? (
                          <Text style={styles.checkMark}>✓</Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.extraLabel,
                          !active && styles.extraLabelOff,
                        ]}
                      >
                        {localized(locale, opt.label, opt.label_arabic)}
                      </Text>
                      <Text style={styles.extraPrice}>
                        +{money(opt.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>
                {t('item.specialInstructions')}
              </Text>
              <Text style={styles.optional}>{t('common.optional')}</Text>
            </View>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder={t('item.specialInstructionsPlaceholder')}
              placeholderTextColor={colors.muted}
              multiline
              maxLength={200}
              textAlignVertical="top"
              style={[
                styles.noteInput,
                specialInstructions
                  ? styles.noteInputFilled
                  : styles.noteInputEmpty,
              ]}
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <QtyStepper value={qty} onChange={setQty} min={1} />
          <Button
            label={t('item.addToCart', { price: money(unitPrice * qty) })}
            style={styles.cta}
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.hero },
  missing: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  hero: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 30,
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  image: { width: '100%', height: '100%' },
  topBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(250,247,242,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 330,
    backgroundColor: colors.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
  },
  sheetBody: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 13,
  },
  meta: { gap: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
    transform: [{ rotate: '-2deg' }],
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  cal: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  price: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.price,
  },
  desc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.sub,
  },
  section: { gap: 9 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  required: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  optional: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choiceCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 1,
  },
  choiceActive: {
    backgroundColor: colors.selBg,
  },
  choiceIdle: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  choiceLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  choiceLabelActive: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.selText,
  },
  choiceHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  choiceHintActive: {
    color: colors.selText,
    opacity: 0.65,
  },
  extraList: { gap: 7 },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: colors.onPrimary,
    fontSize: 12,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 14,
  },
  extraLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  extraLabelOff: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  extraPrice: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  noteInput: {
    minHeight: 88,
    borderRadius: 16,
    backgroundColor: colors.card,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cta: { flex: 1, height: 56 },
});
