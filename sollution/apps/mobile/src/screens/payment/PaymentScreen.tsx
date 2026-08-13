import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import {
  hasStripePublishableKey,
  usePlatformCardPayment,
} from '@/features/stripe-payment';
import type { Order } from '@/core/orders';
import { moneyFixed } from '@/utils/money';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

type PaymentScreenProps = {
  order: Order;
  onBack?: () => void;
  onPaid?: () => void;
};

export function PaymentScreen(props: PaymentScreenProps) {
  if (!hasStripePublishableKey()) {
    return <PaymentMisconfigured {...props} />;
  }
  return <PaymentScreenInner {...props} />;
}

function PaymentMisconfigured({ onBack }: PaymentScreenProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('payment.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.body}>
        <FormError message={t('payment.missingPublishableKey')} />
      </View>
    </View>
  );
}

function PaymentScreenInner({ order, onBack, onPaid }: PaymentScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { confirmPendingPaymentPaid } = useCart();
  const payment = usePlatformCardPayment(order.id);
  const Form = payment.Form;

  const onPayPress = useCallback(async () => {
    const result = await payment.pay();
    if (result !== 'paid') return;
    confirmPendingPaymentPaid();
    onPaid?.();
  }, [confirmPendingPaymentPaid, onPaid, payment]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('payment.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.subtitle}>{t('payment.subtitle')}</Text>

          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>{t('payment.order')}</Text>
            <Text style={styles.summaryCode}>{order.orderCode}</Text>
            <Text style={styles.summaryTotal}>{moneyFixed(order.total)}</Text>
            {payment.meta?.currencyDisplay ? (
              <Text style={styles.summaryHint}>
                {t('payment.chargedAs', {
                  currency: payment.meta.currencyDisplay,
                })}
              </Text>
            ) : null}
          </View>

          {Form ? <Form /> : null}

          {payment.loading ? (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          ) : null}

          <FormError message={payment.errorMessage} />
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <Button
            label={t('payment.payNow')}
            onPress={() => void onPayPress()}
            loading={payment.paying}
            disabled={!payment.ready || payment.loading || payment.paying}
          />
          {!payment.loading && !payment.ready ? (
            <Pressable
              onPress={() => void payment.prepare()}
              disabled={payment.paying}
            >
              <Text style={styles.retry}>{t('common.retry')}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 16,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 22,
  },
  summary: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  summaryCode: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  summaryTotal: {
    marginTop: 8,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  summaryHint: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  spinner: {
    marginTop: 24,
  },
  footer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  retry: {
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.link,
    paddingVertical: 8,
  },
}));
