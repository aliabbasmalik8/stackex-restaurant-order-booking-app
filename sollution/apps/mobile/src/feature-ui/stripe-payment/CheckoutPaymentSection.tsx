import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import {
  getFeatureStatus,
  isFeatureInteractive,
  shouldRenderFeature,
} from '@/features/_registry';
import { colors, typography } from '@/theme';

export type CheckoutPayMethod = 'card' | 'cash';

type CheckoutPaymentSectionProps = {
  pay: CheckoutPayMethod;
  onChange: (method: CheckoutPayMethod) => void;
};

/**
 * Checkout payment picker.
 * Cash is always available; card is gated by `stripePayment`.
 */
export function CheckoutPaymentSection({
  pay,
  onChange,
}: CheckoutPaymentSectionProps) {
  const { t } = useTranslation();
  const payments = getFeatureStatus('stripePayment');
  const paymentsOn = isFeatureInteractive('stripePayment');
  const showCard = shouldRenderFeature('stripePayment');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('checkout.payment')}</Text>

      {showCard ? (
        <Pressable
          disabled={!paymentsOn}
          onPress={() => paymentsOn && onChange('card')}
          style={[
            styles.payRow,
            pay === 'card' && paymentsOn && styles.paySelected,
            !paymentsOn && styles.payDisabled,
          ]}
        >
          <View style={styles.payBadge}>
            <Text style={styles.payBadgeText}>+</Text>
          </View>
          <View style={styles.payLabelWrap}>
            <Text style={styles.payLabel}>{t('checkout.addCard')}</Text>
            {!paymentsOn && payments.reasonKey ? (
              <Text style={styles.inlineHint}>{t(payments.reasonKey)}</Text>
            ) : null}
          </View>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => onChange('cash')}
        style={[styles.payRow, pay === 'cash' && styles.paySelected]}
      >
        <View style={styles.payBadge}>
          <Text style={styles.payBadgeText}>CASH</Text>
        </View>
        <Text style={styles.payLabel}>{t('checkout.cash')}</Text>
      </Pressable>
    </View>
  );
}

/** Resolve method for place-order (card only if stripe is interactive). */
export function resolveCheckoutPaymentMethod(
  pay: CheckoutPayMethod,
): CheckoutPayMethod {
  const showCard = shouldRenderFeature('stripePayment');
  const paymentsOn = isFeatureInteractive('stripePayment');
  return showCard && paymentsOn ? pay : 'cash';
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
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
  inlineHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
});
