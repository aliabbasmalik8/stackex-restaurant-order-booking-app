import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { hasStripePublishableKey } from '@/modules/payments/config';
import { usePlatformCardPayment } from '@/modules/payments/card';
import type { OrderStatus, PaymentStatus } from '@/modules/orders';
import { moneyFixed } from '@/utils/money';
import { colors, radii, spacing, typography } from '@/theme';

type PaymentScreenProps = {
  orderId: string;
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

function PaymentScreenInner({
  orderId,
  onBack,
  onPaid,
}: PaymentScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { lastOrder, setLastOrder } = useCart();
  const payment = usePlatformCardPayment(orderId);
  const Form = payment.Form;

  const order = lastOrder?.id === orderId ? lastOrder : null;

  const onPayPress = useCallback(async () => {
    const result = await payment.pay();
    if (result !== 'paid') return;

    if (lastOrder?.id === orderId) {
      setLastOrder({
        ...lastOrder,
        status: 'pending' as OrderStatus,
        paymentStatus: 'paid' as PaymentStatus,
        paymentMethod: 'card',
        paidAt: new Date().toISOString(),
      });
    }
    onPaid?.();
  }, [lastOrder, onPaid, orderId, payment, setLastOrder]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('payment.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>{t('payment.subtitle')}</Text>

        {order ? (
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
        ) : null}

        {Form ? <Form /> : null}

        {payment.loading ? (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        ) : null}

        <FormError message={payment.errorMessage} />
      </View>

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
    </View>
  );
}

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
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
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
});
