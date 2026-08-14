import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  useReverseGeocode,
  type ReverseGeocodeResult,
} from '@/api/OrderBooking/modules/addresses';
import { Button, FormError, Text } from '@/components/ui';
import { useCatalog } from '@/core/catalog';
import { getErrorMessage } from '@/lib/errors';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import type { MapPin } from './getCurrentPin';
import { PinMap } from './PinMap';

type AddressPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddressPickerSheet({
  visible,
  onClose,
}: AddressPickerSheetProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { primaryBranch } = useCatalog();
  const reverseGeocode = useReverseGeocode();

  const [pin, setPin] = useState<MapPin | null>(null);
  const [lookup, setLookup] = useState<ReverseGeocodeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPin(null);
      setLookup(null);
      setErrorMessage(null);
    }
  }, [visible]);

  const handlePinChange = useCallback((next: MapPin) => {
    setPin(next);
    setLookup(null);
    setErrorMessage(null);
  }, []);

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
    } catch (error) {
      setLookup(null);
      setErrorMessage(
        getErrorMessage(error, t('menu.addressLookupFailed')),
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('menu.addressSheetTitle')}</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PinMap
              key={`${visible}-${primaryBranch?.lat ?? 'seed'}-${primaryBranch?.lng ?? 'seed'}`}
              latitude={primaryBranch?.lat}
              longitude={primaryBranch?.lng}
              onPinChange={handlePinChange}
            />

            {lookup ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t('menu.addressFound')}</Text>
                <Text style={styles.resultMain}>
                  {lookup.formattedAddress || lookup.line1}
                </Text>
                {lookup.line1 ? (
                  <Text style={styles.resultMeta}>{lookup.line1}</Text>
                ) : null}
                {lookup.area || lookup.city ? (
                  <Text style={styles.resultMeta}>
                    {[lookup.area, lookup.city].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <FormError message={errorMessage} />
          </ScrollView>

          <Button
            label={t('menu.confirmLocation')}
            onPress={() => void confirmPin()}
            loading={reverseGeocode.isPending}
            disabled={reverseGeocode.isPending}
            style={styles.confirmBtn}
          />
        </View>
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
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  scroll: {
    flex: 1,
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
    gap: 12,
  },
  resultCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  resultLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  resultMain: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    lineHeight: 21,
  },
  resultMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  confirmBtn: {
    marginTop: 8,
  },
}));
