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
  useCreateAddress,
  useReverseGeocode,
  type ReverseGeocodeResult,
} from '@/api/OrderBooking/modules/addresses';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { useCatalog } from '@/core/catalog';
import { getErrorMessage } from '@/lib/errors';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import { AddressDetailsForm } from './AddressDetailsForm';
import type { MapPin } from './getCurrentPin';
import { PinMap } from './PinMap';

type AddressPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type SheetStep = 'pin' | 'details';

export function AddressPickerSheet({
  visible,
  onClose,
}: AddressPickerSheetProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { primaryBranch } = useCatalog();
  const reverseGeocode = useReverseGeocode();
  const createAddress = useCreateAddress();

  const [step, setStep] = useState<SheetStep>('pin');
  const [pin, setPin] = useState<MapPin | null>(null);
  const [lookup, setLookup] = useState<ReverseGeocodeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetSheet = useCallback(() => {
    setStep('pin');
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

  const onDetails = step === 'details' && lookup;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDetails ? goBackToPin : onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onDetails ? goBackToPin : onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            {onDetails ? <BackButton onPress={goBackToPin} /> : null}
            <Text style={styles.title} numberOfLines={1}>
              {onDetails
                ? t('menu.addressDetailsTitle')
                : t('menu.addressSheetTitle')}
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={onDetails ? styles.hiddenStep : styles.pinStep}
              pointerEvents={onDetails ? 'none' : 'auto'}
            >
              <PinMap
                key={`${visible}-${primaryBranch?.lat ?? 'seed'}-${primaryBranch?.lng ?? 'seed'}`}
                latitude={primaryBranch?.lat}
                longitude={primaryBranch?.lng}
                onPinChange={handlePinChange}
              />
            </View>

            {onDetails ? (
              <AddressDetailsForm
                key={`${lookup.lat},${lookup.lng}`}
                lookup={lookup}
                saving={createAddress.isPending}
                errorMessage={errorMessage}
                onSave={(input) => void saveAddress(input)}
              />
            ) : (
              <FormError message={errorMessage} />
            )}
          </ScrollView>

          {onDetails ? null : (
            <Button
              label={t('menu.confirmLocation')}
              onPress={() => void confirmPin()}
              loading={reverseGeocode.isPending}
              disabled={reverseGeocode.isPending}
              style={styles.confirmBtn}
            />
          )}
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
  hiddenStep: {
    display: 'none',
  },
  confirmBtn: {
    marginTop: 8,
  },
}));
