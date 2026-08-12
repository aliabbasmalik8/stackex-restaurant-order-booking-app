import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { localized } from '@/utils/localized';
import { moneyFixed } from '@/utils/money';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Order } from '@/core/orders';
import { formatAddress, hasAddress } from '@/core/profile';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface ConfirmationScreenProps {
  order: Order;
  onBackToMenu?: () => void;
}

export const ConfirmationScreen = ({
  order,
  onBackToMenu,
}: ConfirmationScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.check}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>{t('confirmation.title')}</Text>
          <Text style={styles.sub}>{t('confirmation.subtitle')}</Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('confirmation.pickupCode')}</Text>
          <Text style={styles.code}>{order.orderCode}</Text>
          <View style={styles.readyPill}>
            <Text style={styles.readyText}>
              {t('confirmation.readyAround', {
                time: order.readyAround ?? '—',
              })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.step, styles.stepActive]}>{t('confirmation.received')}</Text>
            <Text style={styles.step}>{t('confirmation.preparing')}</Text>
            <Text style={styles.step}>{t('confirmation.ready')}</Text>
          </View>
        </View>

        <View style={styles.glass}>
          <View style={styles.locIcon}>
            <Text style={styles.locEmoji}>📍</Text>
          </View>
          <View style={styles.locCopy}>
            <Text style={styles.locTitle}>
              {localized(
                locale,
                order.branchLabel,
                order.branchLabel_arabic,
              )}
            </Text>
            <Text style={styles.locSub}>
              {localized(locale, order.address, order.address_arabic)}
            </Text>
          </View>
          <Text style={styles.directions}>{t('confirmation.directions')}</Text>
        </View>

        {(order.contact.phone || hasAddress(order.customerAddress)) && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>
              {t('confirmation.yourDetails')}
            </Text>
            {order.contact.phone ? (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  {t('confirmation.phone')}
                </Text>
                <Text style={styles.detailsValue}>{order.contact.phone}</Text>
              </View>
            ) : null}
            {hasAddress(order.customerAddress) ? (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>
                  {t('confirmation.address')}
                </Text>
                <Text style={styles.detailsValue}>
                  {formatAddress(order.customerAddress)}
                  {order.customerAddress?.notes?.trim()
                    ? `\n${order.customerAddress.notes.trim()}`
                    : ''}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.summary}>
          {order.items.map((line) => (
            <View key={line.id} style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {line.quantity}×{' '}
                {localized(locale, line.name, line.name_arabic)}
              </Text>
              <Text style={styles.summaryText}>
                {moneyFixed(line.unitPrice * line.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryRule} />
          <View style={styles.summaryRow}>
            <Text style={styles.vat}>{t('confirmation.vat')}</Text>
            <Text style={styles.vat}>{moneyFixed(order.vat)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.paid}>{t('confirmation.totalPaid')}</Text>
            <Text style={styles.paid}>{moneyFixed(order.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <Pressable
          onPress={onBackToMenu}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>{t('confirmation.backToMenu')}</Text>
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
    paddingHorizontal: spacing.screenX,
    paddingBottom: 20,
    gap: 14,
  },
  hero: {
    alignItems: 'center',
    gap: 5,
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 25,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.onHero,
    textAlign: 'center',
  },
  sub: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  codeCard: {
    marginTop: 10,
    borderRadius: 24,
    backgroundColor: colors.confCardBg,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#140806',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  codeLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  code: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 54,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
    lineHeight: 62,
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
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  stepActive: { color: colors.price },
  glass: {
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  locIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locEmoji: { fontSize: 17 },
  locCopy: { flex: 1 },
  locTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  locSub: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  directions: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
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
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.6)',
  },
  paid: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backBtn: {
    height: 54,
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
    fontSize: 14.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.backText,
  },
}));
