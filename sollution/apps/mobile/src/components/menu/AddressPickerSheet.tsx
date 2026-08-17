import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  useAddresses,
  useCreateAddress,
  useReverseGeocode,
  useSetDefaultAddress,
  type ReverseGeocodeResult,
  type UserAddressDto,
} from '@/api/OrderBooking/modules/addresses';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { useCatalog } from '@/core/catalog';
import { getErrorMessage } from '@/lib/errors';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import { AddressDetailsForm } from './AddressDetailsForm';
import { AddressList } from './AddressList';
import type { MapPin } from './getCurrentPin';
import { PinMap } from './PinMap';

type AddressPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type SheetStep = 'list' | 'pin' | 'details';

export function AddressPickerSheet({
  visible,
  onClose,
}: AddressPickerSheetProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { primaryBranch } = useCatalog();
  const { data: addresses = [] } = useAddresses(visible);
  const reverseGeocode = useReverseGeocode();
  const createAddress = useCreateAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [step, setStep] = useState<SheetStep>('list');
  const [pin, setPin] = useState<MapPin | null>(null);
  const [lookup, setLookup] = useState<ReverseGeocodeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetSheet = useCallback(() => {
    setStep('list');
    setPin(null);
    setLookup(null);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!visible) resetSheet();
  }, [visible, resetSheet]);

  const handlePinChange = useCallback((next: MapPin) => {
    setPin(next);
    setErrorMessage(null);
  }, []);

  const goToList = () => {
    setStep('list');
    setLookup(null);
    setErrorMessage(null);
  };

  const goBackToPin = () => {
    setStep('pin');
    setLookup(null);
    setErrorMessage(null);
  };

  const confirmPin = async () => {
    if (!pin) {
      setErrorMessage(t('menu.needLocationFirst'));
      return;
    }
    setErrorMessage(null);
    try {
      const result = await reverseGeocode.mutateAsync({
        lat: pin.latitude,
        lng: pin.longitude,
      });
      setLookup(result);
      setStep('details');
    } catch (error) {
      setLookup(null);
      setErrorMessage(getErrorMessage(error, t('menu.addressLookupFailed')));
    }
  };

  const saveAddress = async (input: {
    label: string;
    line2: string;
    notes: string;
  }) => {
    if (!lookup) return;
    setErrorMessage(null);
    try {
      await createAddress.mutateAsync({
        label: input.label,
        line1: lookup.line1 || lookup.formattedAddress,
        line2: input.line2,
        area: lookup.area,
        city: lookup.city || lookup.area || '—',
        notes: input.notes,
        lat: lookup.lat,
        lng: lookup.lng,
        isDefault: true,
      });
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.saveAddressFailed')));
    }
  };

  const selectAddress = async (address: UserAddressDto) => {
    if (address.isDefault) {
      onClose();
      return;
    }
    setErrorMessage(null);
    try {
      await setDefaultAddress.mutateAsync(address.id);
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.selectAddressFailed')));
    }
  };

  const onList = step === 'list';
  const onPin = step === 'pin';
  const onDetails = step === 'details' && lookup;

  const handleRequestClose = () => {
    if (onDetails) goBackToPin();
    else if (onPin) goToList();
    else onClose();
  };

  const title = onDetails
    ? t('menu.addressDetailsTitle')
    : onPin
      ? t('menu.addressSheetTitle')
      : t('menu.addressListTitle');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleRequestClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={handleRequestClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            {onList ? null : (
              <BackButton onPress={onDetails ? goBackToPin : goToList} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {onList ? (
              <>
                <AddressList
                  addresses={addresses}
                  selectingId={
                    setDefaultAddress.isPending
                      ? (setDefaultAddress.variables ?? null)
                      : null
                  }
                  onSelect={(address) => void selectAddress(address)}
                  onAdd={() => {
                    setErrorMessage(null);
                    setStep('pin');
                  }}
                />
                <FormError message={errorMessage} />
              </>
            ) : null}

            {onPin ? (
              <View style={styles.pinStep}>
                <PinMap
                  key={`${visible}-${primaryBranch?.lat ?? 'seed'}-${primaryBranch?.lng ?? 'seed'}`}
                  latitude={primaryBranch?.lat}
                  longitude={primaryBranch?.lng}
                  onPinChange={handlePinChange}
                />
              </View>
            ) : null}

            {onDetails ? (
              <AddressDetailsForm
                key={`${lookup.lat},${lookup.lng}`}
                lookup={lookup}
                saving={createAddress.isPending}
                errorMessage={errorMessage}
                onSave={(input) => void saveAddress(input)}
              />
            ) : onPin ? (
              <FormError message={errorMessage} />
            ) : null}
          </ScrollView>

          {onPin ? (
            <Button
              label={t('menu.confirmLocation')}
              onPress={() => void confirmPin()}
              loading={reverseGeocode.isPending}
              disabled={reverseGeocode.isPending}
              style={styles.confirmBtn}
            />
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,34,56,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screenX,
    paddingTop: 10,
    height: '88%',
    maxHeight: '92%',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  scroll: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
    gap: 12,
  },
  pinStep: {
    flex: 1,
    minHeight: 280,
  },
  confirmBtn: {
    marginTop: 8,
  },
}));
