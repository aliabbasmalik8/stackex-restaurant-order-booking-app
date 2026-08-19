import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  type LayoutChangeEvent,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { localized } from '@/utils/localized';
import { moneyFixed } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Order } from '@/core/orders';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import {
  confirmationLayoutFromWidth,
} from './confirmationLayout';

interface ConfirmationScreenProps {
  order: Order;
  onBackToMenu?: () => void;
}

const PROGRESS_FILL = '40%';
const initialWindow = Dimensions.get('window');

export const ConfirmationScreen = ({
  order,
  onBackToMenu,
}: ConfirmationScreenProps) => {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(initialWindow.width);
  const layout = confirmationLayoutFromWidth(
    availableWidth > 0 ? availableWidth : initialWindow.width,
  );

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(String(order.orderCode));
    setCopied(true);
  };

  const onRootLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== availableWidth) setAvailableWidth(width);
  };

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + layout.heroTopPad }]}
      onLayout={onRootLayout}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: layout.paddingX,
            gap: layout.scrollGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.check,
              {
                width: layout.checkSize,
                height: layout.checkSize,
                borderRadius: layout.checkSize / 2,
              },
            ]}
          >
              <Text
                style={[styles.checkMark, { fontSize: layout.checkMarkSize }]}
              >
                ✓
              </Text>
          </View>
            <Text style={[styles.title, { fontSize: layout.titleSize }]}>
              {t('confirmation.title')}
            </Text>
            <Text style={[styles.sub, { fontSize: layout.subSize }]}>
              {t('confirmation.subtitle')}
            </Text>
        </View>

        <Pressable
            onPress={() => void handleCopyCode()}
            style={({ pressed }) => [
              styles.codeCard,
              {
                borderRadius: layout.codeCardRadius,
                padding: layout.codeCardPad,
              },
              pressed && styles.codeCardPressed,
            ]}
          >
            <Text style={styles.codeLabel}>{t('confirmation.pickupCode')}</Text>
            <Text
              style={[
                styles.code,
                {
                  fontSize: layout.codeSize,
                  lineHeight: layout.codeLineHeight,
                },
              ]}
            >
              {order.orderCode}
            </Text>
            <Text style={[styles.codeHint, { fontSize: layout.codeHintSize }]}>
              {copied
                ? t('confirmation.pickupCodeCopied')
                : t('confirmation.pickupCodeHint')}
            </Text>
            <View style={styles.readyPill}>
              <Text
                style={[styles.readyText, { fontSize: layout.pillTextSize }]}
              >
                {t('confirmation.readyAround', {
                  time: order.readyAround ?? '—',
                })}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: PROGRESS_FILL }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text
                style={[
                  styles.step,
                  styles.stepActive,
                  { fontSize: layout.progressLabelSize },
                ]}
              >
                {t('confirmation.received')}
              </Text>
              <Text style={[styles.step, { fontSize: layout.progressLabelSize }]}>
                {t('confirmation.preparing')}
              </Text>
              <Text style={[styles.step, { fontSize: layout.progressLabelSize }]}>
                {t('confirmation.ready')}
              </Text>
            </View>
          </Pressable>

        <View
            style={[
              styles.glass,
              {
                paddingVertical: layout.glassPadY,
                paddingHorizontal: layout.glassPadX,
                gap: layout.glassGap,
              },
            ]}
          >
            <View
              style={[
                styles.locIcon,
                {
                  width: layout.locIconSize,
                  height: layout.locIconSize,
                },
              ]}
            >
              <Text style={[styles.locEmoji, { fontSize: layout.locEmojiSize }]}>
                📍
              </Text>
            </View>
            <View style={styles.locCopy}>
              <Text style={[styles.locTitle, { fontSize: layout.locTitleSize }]}>
                {localized(
                  locale,
                  order.branchLabel,
                  order.branchLabel_arabic,
                )}
              </Text>
              <Text style={[styles.locSub, { fontSize: layout.locSubSize }]}>
                {localized(locale, order.address, order.address_arabic)}
              </Text>
            </View>
            <Text
              style={[styles.directions, { fontSize: layout.directionsSize }]}
            >
              {t('confirmation.directions')}
            </Text>
          </View>

        <View
            style={[
              styles.summary,
              {
                paddingVertical: layout.summaryPadY,
                paddingHorizontal: layout.summaryPadX,
              },
            ]}
          >
            {order.items.map((line) => (
              <View key={line.id} style={styles.summaryRow}>
                <Text
                  style={[styles.summaryText, { fontSize: layout.summaryTextSize }]}
                >
                  {line.quantity}×{' '}
                  {localized(locale, line.name, line.name_arabic)}
                </Text>
                <Text
                  style={[styles.summaryText, { fontSize: layout.summaryTextSize }]}
                >
                  {moneyFixed(line.unitPrice * line.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryRule} />
            <View style={styles.summaryRow}>
              <Text style={[styles.vat, { fontSize: layout.metaSize }]}>
                {t('confirmation.subtotal')}
              </Text>
              <Text style={[styles.vat, { fontSize: layout.metaSize }]}>
                {moneyFixed(order.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.vat, { fontSize: layout.metaSize }]}>
                {t('confirmation.vat')}
              </Text>
              <Text style={[styles.vat, { fontSize: layout.metaSize }]}>
                {moneyFixed(order.vat)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.paid, { fontSize: layout.paidSize }]}>
                {t('confirmation.totalPaid')}
              </Text>
              <Text style={[styles.paid, { fontSize: layout.paidSize }]}>
                {moneyFixed(order.total)}
              </Text>
            </View>
          </View>
      </ScrollView>

      <View
          style={[
            styles.footer,
            {
              paddingHorizontal: layout.footerPadX,
              paddingTop: layout.footerPadTop,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <Pressable
            onPress={onBackToMenu}
            style={({ pressed }) => [
              styles.backBtn,
              { height: layout.backBtnHeight },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.backText, { fontSize: layout.backTextSize }]}>
              {t('confirmation.backToMenu')}
            </Text>
          </Pressable>
        </View>
    </View>
  );
};

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.hero,
  },
  scroll: {
    paddingBottom: 20,
  },
  hero: {
    alignItems: 'center',
    gap: 5,
  },
  check: {
    backgroundColor: colors.checkBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    transform: [{ rotate: '-4deg' }],
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkMark: {
    fontSize: 28,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.checkText,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.onHero,
    textAlign: 'center',
  },
  sub: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  codeCard: {
    marginTop: 10,
    backgroundColor: colors.confCardBg,
    alignItems: 'center',
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  codeCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  codeLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  codeHint: {
    marginTop: 4,
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  code: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
    color: colors.price,
  },
  readyPill: {
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  readyText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  progressTrack: {
    marginTop: 14,
    width: '100%',
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%',
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.price,
  },
  progressLabels: {
    width: '100%',
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  stepActive: { color: colors.price },
  glass: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIcon: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locEmoji: {},
  locCopy: { flex: 1 },
  locTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  locSub: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  directions: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.9)',
  },
  detailsCard: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  detailsTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  detailsRow: {
    gap: 4,
  },
  detailsLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.6)',
  },
  detailsValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  summary: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.85)',
  },
  summaryRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 2,
  },
  vat: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.6)',
  },
  paid: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  footer: {
  },
  backBtn: {
    borderRadius: radii.pill,
    backgroundColor: colors.backBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  pressed: { opacity: 0.9 },
  backText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.backText,
  },
}));
