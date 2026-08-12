import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { AddressFields } from '@/components/profile/AddressFields';
import { AddressModal } from '@/components/checkout/AddressModal';
import { useAuth } from '@/context/AuthContext';
import {
  CheckoutPaymentSection,
  resolveCheckoutPaymentMethod,
  type CheckoutPayMethod,
} from '@/feature-ui/stripe-payment';
import {
  emptyAddress,
  hasAddress,
  type UserAddress,
} from '@/core/profile';
import type { CheckoutContact } from '@/types/cart';
import { moneyFixed } from '@/utils/money';
import { useBrand, useStoreAvailability } from '@/core/settings';
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface CheckoutScreenProps {
  total: number;
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
  /** Persist address to profile (Save & done). */
  onSaveAddressToProfile?: (address: UserAddress) => void | Promise<void>;
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

export const CheckoutScreen = ({
  total,
  placing,
  errorMessage,
  onBack,
  onPlaceOrder,
  onEditProfile,
  onSaveAddressToProfile,
}: CheckoutScreenProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const brand = useBrand();
  const { isClosed, closedMessage } = useStoreAvailability();
  const [pay, setPay] = useState<CheckoutPayMethod>('cash');
  const [phoneLocal, setPhoneLocal] = useState(() =>
    localPhoneDigits(profile?.phone, brand.dialCode),
  );
  /** Order-scoped address (may differ from profile until Save & done). */
  const [orderAddress, setOrderAddress] = useState<UserAddress | null>(
    () => (hasAddress(profile?.address) ? profile!.address : null),
  );
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const displayName =
    profile?.shortName ?? profile?.name ?? t('profile.fallbackName');
  const addressReady = hasAddress(orderAddress);

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
        keyboardShouldPersistTaps="handled"
      >
        {isClosed ? <StoreClosedBanner compact /> : null}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('checkout.yourInfo')}</Text>
            {onEditProfile ? (
              <Pressable onPress={onEditProfile} hitSlop={8}>
                <Text style={styles.editLink}>{t('common.edit')}</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoLabel}>{t('checkout.name')}</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoLabel}>{t('checkout.phone')}</Text>
              <View style={styles.phoneValue}>
                <Text style={styles.infoValue}>{brand.dialCode}</Text>
                <TextInput
                  value={phoneLocal}
                  onChangeText={setPhoneLocal}
                  placeholder={t('auth.phonePlaceholder')}
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  style={styles.phoneInput}
                />
              </View>
            </View>
            <View style={styles.addressBlock}>
              <View style={styles.addressHead}>
                <Text style={styles.infoLabel}>{t('checkout.address')}</Text>
                <Pressable
                  onPress={() => setAddressModalOpen(true)}
                  hitSlop={8}
                >
                  <Text style={styles.editLink}>
                    {addressReady
                      ? t('common.edit')
                      : t('checkout.addressAdd')}
                  </Text>
                </Pressable>
              </View>
              {addressReady && orderAddress ? (
                <AddressFields
                  value={orderAddress}
                  onChange={() => undefined}
                  readOnly
                />
              ) : (
                <Pressable onPress={() => setAddressModalOpen(true)}>
                  <Text style={styles.addressEmpty}>
                    {t('checkout.addressMissing')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
          <Text style={styles.hint}>{t('checkout.whatsappHint')}</Text>
        </View>

        <CheckoutPaymentSection pay={pay} onChange={setPay} />
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
        <FormError message={errorMessage ?? (isClosed ? closedMessage : null)} />
        <Button
          label={isClosed ? t('store.closedCta') : t('checkout.placeOrder')}
          onPress={() =>
            onPlaceOrder?.({
              phone: toFullPhone(phoneLocal, brand.dialCode),
              address: orderAddress ?? emptyAddress(),
              paymentMethod: resolveCheckoutPaymentMethod(pay),
            })
          }
          loading={placing}
          disabled={placing || isClosed}
        />
      </View>

      <AddressModal
        visible={addressModalOpen}
        initial={orderAddress}
        onClose={() => setAddressModalOpen(false)}
        onDone={(address) => {
          setOrderAddress(address);
          setAddressModalOpen(false);
        }}
        onSaveAndDone={
          onSaveAddressToProfile
            ? async (address) => {
                await onSaveAddressToProfile(address);
                setOrderAddress(address);
                setAddressModalOpen(false);
              }
            : undefined
        }
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  editLink: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
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
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    textAlign: 'right',
  },
  addressBlock: {
    paddingVertical: 15,
    paddingHorizontal: 17,
    gap: 8,
  },
  addressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressEmpty: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.link,
    lineHeight: 20,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
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
}));
