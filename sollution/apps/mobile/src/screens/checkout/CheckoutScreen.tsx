import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  getServiceStatus,
  isServiceInteractive,
  shouldRenderService,
} from '@/modules/services';
import { moneyFixed } from '@/utils/money';
import { colors, radii, spacing, typography } from '@/theme';

type PayMethod = 'card' | 'cash';

interface CheckoutScreenProps {
  total: number;
  placing?: boolean;
  onBack?: () => void;
  onPlaceOrder?: () => void;
}

export const CheckoutScreen = ({
  total,
  placing,
  onBack,
  onPlaceOrder,
}: CheckoutScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [pay, setPay] = useState<PayMethod>('cash');

  const payments = getServiceStatus('paymentMethods');
  const paymentsOn = isServiceInteractive('paymentMethods');
  const showPayments = shouldRenderService('paymentMethods');

  const displayName =
    profile?.shortName ?? profile?.name ?? t('profile.fallbackName');
  const displayContact = profile?.contact ?? '—';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('checkout.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.yourInfo')}</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoLabel}>{t('checkout.name')}</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {profile?.phone ? t('checkout.phone') : t('auth.email')}
              </Text>
              <Text style={styles.infoValue}>{displayContact}</Text>
            </View>
          </View>
          <Text style={styles.hint}>{t('checkout.whatsappHint')}</Text>
        </View>

        {showPayments ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('checkout.payment')}</Text>

            <Pressable
              disabled={!paymentsOn}
              onPress={() => paymentsOn && setPay('card')}
              style={[
                styles.payRow,
                !paymentsOn && styles.payDisabled,
              ]}
            >
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>+</Text>
              </View>
              <View style={styles.payLabelWrap}>
                <Text style={styles.payLabel}>{t('checkout.addCard')}</Text>
                {!paymentsOn && payments.reasonKey ? (
                  <Text style={styles.inlineHint}>
                    {t(payments.reasonKey)}
                  </Text>
                ) : null}
              </View>
            </Pressable>

            <Pressable
              onPress={() => setPay('cash')}
              style={[styles.payRow, pay === 'cash' && styles.paySelected]}
            >
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>CASH</Text>
              </View>
              <Text style={styles.payLabel}>{t('checkout.cash')}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>{t('checkout.totalInclVat')}</Text>
          <Text style={styles.footerAmount}>{moneyFixed(total)}</Text>
        </View>
        <Button
          label={t('checkout.placeOrder')}
          onPress={onPlaceOrder}
          loading={placing}
          disabled={placing}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  body: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 20,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  inlineHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  infoCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
  infoBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  infoValue: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  paySelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  payDisabled: {
    opacity: 0.55,
  },
  payBadge: {
    width: 34,
    height: 23,
    borderRadius: 5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBadgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 8,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.sub,
  },
  payLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  payLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  footerLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  footerAmount: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
});
