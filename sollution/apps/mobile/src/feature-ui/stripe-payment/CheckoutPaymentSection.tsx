import { View, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import {
  getFeatureStatus,
  isFeatureInteractive,
  shouldRenderFeature,
} from '@/features/_registry';
import { StyleSheet } from 'react-native';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Pressable> & { style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      {...props}
      style={[style, animStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        (props as any).onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        (props as any).onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const payments = getFeatureStatus('stripePayment');
  const paymentsOn = isFeatureInteractive('stripePayment');
  const showCard = shouldRenderFeature('stripePayment');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('checkout.payment')}</Text>

      <View style={styles.card}>
        {showCard ? (
          <ScalePressable
            disabled={!paymentsOn}
            onPress={() => paymentsOn && onChange('card')}
            style={[
              styles.payRow,
              styles.payBorder,
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
          </ScalePressable>
        ) : null}

        <ScalePressable
          onPress={() => onChange('cash')}
          style={[
            styles.payRow,
            pay === 'cash' && styles.paySelected,
          ]}
        >
          <View style={styles.payBadge}>
            <Text style={styles.payBadgeText}>CASH</Text>
          </View>
          <Text style={styles.payLabel}>{t('checkout.cash')}</Text>
        </ScalePressable>
      </View>
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

const styles = createStyles((colors) => ({
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  payBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  paySelected: {
    backgroundColor: colors.surface,
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
}));
