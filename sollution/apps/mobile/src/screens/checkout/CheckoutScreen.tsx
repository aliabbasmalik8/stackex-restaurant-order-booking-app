
import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { AddressPickerSheet } from '@/components/menu/AddressPickerSheet';
import { useAddresses } from '@/api/OrderBooking/modules/addresses';
import { useAuth } from '@/context/AuthContext';
import {
  CheckoutPaymentSection,
  resolveCheckoutPaymentMethod,
  type CheckoutPayMethod,
} from '@/feature-ui/stripe-payment';
import {
  formatAddress,
  hasAddress,
  toCustomerAddress,
} from '@/core/profile';
import type { CheckoutContact } from '@/types/cart';
import { moneyFixed } from '@/utils/money';
import { useBrand, useStoreAvailability } from '@/core/settings';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { radii, typography, createStyles, useTheme } from '@/theme';
import { checkoutLayoutFromWidth, type CheckoutLayout } from './checkoutLayout';

const initialWindow = Dimensions.get('window');

interface CheckoutScreenProps {
  total: number;
  subtotal: number;
  vat: number;
  itemCount: number;
  placing?: boolean;
  errorMessage?: string | null;
  onBack?: () => void;
  onPlaceOrder?: (
    contact: Omit<CheckoutContact, 'name'> & {
      name?: string;
      paymentMethod: CheckoutPayMethod;
    },
  ) => void;
  onEditProfile?: () => void;
}

function localPhoneDigits(
  stored: string | null | undefined,
  dialCode: string,
): string {
  const raw = stored?.trim() ?? '';
  if (!raw) return '';

  const dial = dialCode.replace('+', '');

  if (raw.startsWith(dialCode)) {
    return raw.slice(dialCode.length).trim();
  }

  if (raw.startsWith(`+${dial}`)) {
    return raw.slice(dial.length + 1).trim();
  }

  if (raw.startsWith('00' + dial)) {
    return raw.slice(dial.length + 2).trim();
  }

  return raw;
}

function toFullPhone(local: string, dialCode: string): string {
  const digits = local.replace(/[\s-]/g, '');

  if (!digits) return '';
  if (digits.startsWith('+')) return digits;

  return `${dialCode}${digits}`;
}

const TRACK_W = 48;
const TRACK_H = 28;
const THUMB_SIZE = 22;
const THUMB_TRAVEL = TRACK_W - THUMB_SIZE - 6;

function SpringToggle({
  value,
  onValueChange,
  trackColorOff,
  trackColorOn,
  thumbColor,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  trackColorOff: string;
  trackColorOn: string;
  thumbColor: string;
}) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 14,
      stiffness: 170,
      mass: 0.8,
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [trackColorOff, trackColorOn],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[toggleStyles.track, trackStyle]}>
        <Animated.View
          style={[
            toggleStyles.thumb,
            { backgroundColor: thumbColor },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const toggleStyles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export const CheckoutScreen = ({
  total,
  subtotal,
  vat,
  itemCount,
  placing,
  errorMessage,
  onBack,
  onPlaceOrder,
  onEditProfile,
}: CheckoutScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const brand = useBrand();
  const { isClosed, closedMessage } = useStoreAvailability();

  const { data: addresses = [] } = useAddresses(true);

  const [pay, setPay] = useState<CheckoutPayMethod>('cash');
  const [whatsappNotify, setWhatsappNotify] = useState(true);
  const [availableWidth, setAvailableWidth] = useState(initialWindow.width);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState(() =>
    localPhoneDigits(profile?.phone, brand.dialCode),
  );

  const layout: CheckoutLayout = checkoutLayoutFromWidth(
    availableWidth > 0 ? availableWidth : initialWindow.width,
  );

  const displayName =
    profile?.shortName ?? profile?.name ?? t('profile.fallbackName');

  const defaultAddress =
    addresses.find((row) => row.isDefault) ?? addresses[0] ?? null;

  const orderAddress = defaultAddress
    ? toCustomerAddress(defaultAddress)
    : null;

  const addressReady = hasAddress(orderAddress);

  const onRootLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    if (width > 0 && width !== availableWidth) {
      setAvailableWidth(width);
    }
  };

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      onLayout={onRootLayout}
    >
      <View style={[styles.header, { paddingHorizontal: layout.paddingX }]}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { fontSize: layout.titleSize }]}>
          {t('checkout.title')}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          {
            paddingHorizontal: layout.paddingX,
            paddingTop: layout.bodyPadTop,
            gap: layout.bodyGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isClosed ? <StoreClosedBanner compact /> : null}

        <View
          style={[
            styles.summaryStrip,
            {
              paddingVertical: layout.summaryStripPadY,
              paddingHorizontal: layout.rowPadX,
            },
          ]}
        >
          <Text
            style={[
              styles.summaryText,
              { fontSize: layout.summaryStripSize },
            ]}
          >
            {t('checkout.orderSummary', {
              count: itemCount,
              total: moneyFixed(total),
            })}
          </Text>
        </View>

        <View style={[styles.section, { gap: layout.sectionGap }]}>
            <View style={styles.sectionHead}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: layout.sectionTitleSize },
                ]}
              >
                {t('checkout.yourInfo')}
              </Text>

              {onEditProfile ? (
                <Pressable onPress={onEditProfile} hitSlop={8}>
                  <Text
                    style={[
                      styles.editLink,
                      { fontSize: layout.editLinkSize },
                    ]}
                  >
                    {t('common.edit')}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoRow,
                  styles.infoBorder,
                  {
                    paddingVertical: layout.rowPadY,
                    paddingHorizontal: layout.rowPadX,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    { fontSize: layout.labelSize },
                  ]}
                >
                  {t('checkout.name')}
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    { fontSize: layout.valueSize },
                  ]}
                >
                  {displayName}
                </Text>
              </View>

              <View
                style={[
                  styles.infoRow,
                  styles.infoBorder,
                  {
                    paddingVertical: layout.rowPadY,
                    paddingHorizontal: layout.rowPadX,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    { fontSize: layout.labelSize },
                  ]}
                >
                  {t('checkout.phone')}
                </Text>

                <View style={styles.phoneValue}>
                  <Text
                    style={[
                      styles.infoValue,
                      { fontSize: layout.valueSize },
                    ]}
                  >
                    {brand.dialCode}
                  </Text>
                  <TextInput
                    value={phoneLocal}
                    onChangeText={setPhoneLocal}
                    placeholder={t('auth.phonePlaceholder')}
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                    editable={!placing}
                    style={[
                      styles.phoneInput,
                      { fontSize: layout.valueSize },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.addressBlock,
                  {
                    paddingVertical: layout.rowPadY,
                    paddingHorizontal: layout.rowPadX,
                  },
                ]}
              >
                <View style={styles.addressHead}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { fontSize: layout.labelSize },
                    ]}
                  >
                    {t('checkout.address')}
                  </Text>

                  <Pressable
                    onPress={() => setAddressSheetOpen(true)}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.editLink,
                        { fontSize: layout.editLinkSize },
                      ]}
                    >
                      {addressReady
                        ? t('common.edit')
                        : t('checkout.addressAdd')}
                    </Text>
                  </Pressable>
                </View>

                {addressReady && defaultAddress ? (
                  <View style={styles.addressCopy}>
                    <Text style={styles.addressLabel}>
                      {defaultAddress.label}
                    </Text>

                    <Text style={styles.addressLine}>
                      {formatAddress(orderAddress)}
                    </Text>

                    {orderAddress?.notes?.trim() ? (
                      <Text style={styles.addressNotes}>
                        {orderAddress.notes.trim()}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setAddressSheetOpen(true)}
                  >
                    <Text style={styles.addressEmpty}>
                      {t('checkout.addressMissing')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

        <View style={styles.infoCard}>
            <View
              style={[
                styles.toggleRow,
                {
                  paddingVertical: layout.togglePadY,
                  paddingHorizontal: layout.rowPadX,
                },
              ]}
            >
              <View style={styles.toggleLabel}>
                <Text
                  style={[
                    styles.infoValue,
                    { fontSize: layout.valueSize },
                  ]}
                >
                  {t('checkout.whatsappToggle')}
                </Text>

                <Text
                  style={[
                    styles.hint,
                    { fontSize: layout.hintSize },
                  ]}
                >
                  {t('checkout.whatsappHint')}
                </Text>
              </View>

              <SpringToggle
                value={whatsappNotify}
                onValueChange={setWhatsappNotify}
                trackColorOff={colors.divider}
                trackColorOn={colors.primary}
                thumbColor={colors.card}
              />
            </View>
          </View>

        <CheckoutPaymentSection
          pay={pay}
          onChange={setPay}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: layout.footerPadX,
            paddingTop: layout.footerPadY,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryRow,
                styles.summaryBorder,
                {
                  paddingVertical: layout.summaryRowPadY,
                  paddingHorizontal: layout.summaryRowPadX,
                },
              ]}
            >
              <Text
                style={[
                  styles.footerLabel,
                  { fontSize: layout.footerLabelSize },
                ]}
              >
                {t('cart.subtotal')}
              </Text>

              <Text
                style={[
                  styles.footerLabel,
                  { fontSize: layout.footerLabelSize },
                ]}
              >
                {moneyFixed(subtotal)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryRow,
                styles.summaryBorder,
                {
                  paddingVertical: layout.summaryRowPadY,
                  paddingHorizontal: layout.summaryRowPadX,
                },
              ]}
            >
              <Text
                style={[
                  styles.footerLabel,
                  { fontSize: layout.footerLabelSize },
                ]}
              >
                {t('cart.vat')}
              </Text>

              <Text
                style={[
                  styles.footerLabel,
                  { fontSize: layout.footerLabelSize },
                ]}
              >
                {moneyFixed(vat)}
              </Text>
            </View>

            <View
              style={[
                styles.summaryRow,
                {
                  paddingVertical: layout.summaryRowPadY,
                  paddingHorizontal: layout.summaryRowPadX,
                },
              ]}
            >
              <Text
                style={[
                  styles.footerAmount,
                  { fontSize: layout.footerAmountSize },
                ]}
              >
                {t('checkout.totalInclVat')}
              </Text>

              <Text
                style={[
                  styles.footerAmount,
                  { fontSize: layout.footerAmountSize },
                ]}
              >
                {moneyFixed(total)}
              </Text>
            </View>
          </View>

          <FormError
            message={errorMessage ?? (isClosed ? closedMessage : null)}
          />

          <Button
            label={
              isClosed
                ? t('store.closedCta')
                : t('checkout.placeOrder')
            }
            onPress={() =>
              onPlaceOrder?.({
                phone: toFullPhone(phoneLocal, brand.dialCode),
                address: orderAddress ?? { line1: '', city: '' },
                paymentMethod: resolveCheckoutPaymentMethod(pay),
              })
            }
            loading={placing}
            disabled={placing || isClosed}
          />
        </View>

      <AddressPickerSheet
        visible={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
      />
    </View>
  );
};

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

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

  body: {
    paddingBottom: 20,
  },

  summaryStrip: {
    borderRadius: radii.md,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  summaryText: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
    textAlign: 'center',
  },

  section: {},

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },

  editLink: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
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
  },

  infoBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },

  infoLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },

  infoValue: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },

  phoneValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginLeft: 12,
  },

  phoneInput: {
    minWidth: 120,
    maxWidth: 160,
    padding: 0,
    margin: 0,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    textAlign: 'right',
  },

  addressBlock: {
    gap: 6,
  },

  addressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  addressCopy: {
    gap: 2,
  },

  addressLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },

  addressLine: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    lineHeight: 20,
  },

  addressNotes: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 18,
  },

  addressEmpty: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.link,
    lineHeight: 20,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  toggleLabel: {
    flex: 1,
    gap: 2,
  },

  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },

  footer: {
    gap: 10,
  },

  summaryCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },

  footerLabel: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },

  footerAmount: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
}));

