import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
  useDeleteAddress,
  useReverseGeocode,
  useSetDefaultAddress,
  useUpdateAddress,
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
import { PlaceSearchField } from './PlaceSearchField';

type AddressPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type SheetStep = 'list' | 'pin' | 'search' | 'details';

/** ~25m — map settle vs an intentional pan. */
const PIN_STILL_DELTA = 0.00022;

function pinUnchanged(
  pin: MapPin | null,
  origin: Pick<UserAddressDto, 'lat' | 'lng'> | null,
): boolean {
  if (!pin || !origin) return false;
  return (
    Math.abs(pin.latitude - origin.lat) < PIN_STILL_DELTA &&
    Math.abs(pin.longitude - origin.lng) < PIN_STILL_DELTA
  );
}

function lookupFromAddress(address: UserAddressDto): ReverseGeocodeResult {
  return {
    line1: address.line1,
    line2: address.line2,
    area: address.area,
    city: address.city,
    formattedAddress: [address.line1, address.line2, address.area, address.city]
      .filter((part) => part?.trim())
      .join(', '),
    lat: address.lat,
    lng: address.lng,
  };
}

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
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [step, setStep] = useState<SheetStep>('list');
  const [pin, setPin] = useState<MapPin | null>(null);
  const [lookup, setLookup] = useState<ReverseGeocodeResult | null>(null);
  const [pickedLookup, setPickedLookup] =
    useState<ReverseGeocodeResult | null>(null);
  const [editing, setEditing] = useState<UserAddressDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetSheet = useCallback(() => {
    setStep('list');
    setPin(null);
    setLookup(null);
    setPickedLookup(null);
    setEditing(null);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!visible) resetSheet();
  }, [visible, resetSheet]);

  const handlePinChange = useCallback((next: MapPin) => {
    setPin(next);
    setErrorMessage(null);
    setPickedLookup((current) => {
      if (!current) return current;
      return pinUnchanged(next, current) ? current : null;
    });
  }, []);

  const handlePlacePicked = useCallback((result: ReverseGeocodeResult) => {
    setPin({ latitude: result.lat, longitude: result.lng });
    setPickedLookup(result);
    setErrorMessage(null);
    setStep('pin');
  }, []);

  const goToList = () => {
    setStep('list');
    setPin(null);
    setLookup(null);
    setPickedLookup(null);
    setEditing(null);
    setErrorMessage(null);
  };

  const goBackToPin = () => {
    setStep('pin');
    if (lookup) setPickedLookup(lookup);
    setLookup(null);
    setErrorMessage(null);
  };

  const openSearch = () => {
    setErrorMessage(null);
    setStep('search');
  };

  const keepExistingPin = Boolean(editing) && pinUnchanged(pin, editing);
  const keepPickedPlace = Boolean(pickedLookup) && pinUnchanged(pin, pickedLookup);
  const skipGeocode = keepExistingPin || keepPickedPlace;

  const confirmPin = async () => {
    if (editing && keepExistingPin) {
      setErrorMessage(null);
      setLookup(lookupFromAddress(editing));
      setStep('details');
      return;
    }
    if (pickedLookup && pinUnchanged(pin, pickedLookup)) {
      setErrorMessage(null);
      setLookup(pickedLookup);
      setStep('details');
      return;
    }
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
      if (editing) {
        await updateAddress.mutateAsync({
          id: editing.id,
          body: {
            label: input.label,
            line1: lookup.line1 || lookup.formattedAddress,
            line2: input.line2,
            area: lookup.area,
            city: lookup.city || lookup.area || '—',
            notes: input.notes,
            lat: lookup.lat,
            lng: lookup.lng,
          },
        });
        goToList();
        return;
      }
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
      setErrorMessage(
        getErrorMessage(
          error,
          editing ? t('menu.updateAddressFailed') : t('menu.saveAddressFailed'),
        ),
      );
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

  const startEdit = (address: UserAddressDto) => {
    setErrorMessage(null);
    setEditing(address);
    setLookup(null);
    setPickedLookup(null);
    setPin({ latitude: address.lat, longitude: address.lng });
    setStep('pin');
  };

  const confirmDelete = (address: UserAddressDto) => {
    Alert.alert(t('menu.deleteAddressTitle'), t('menu.deleteAddressConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setErrorMessage(null);
            try {
              await deleteAddress.mutateAsync(address.id);
            } catch (error) {
              setErrorMessage(
                getErrorMessage(error, t('menu.deleteAddressFailed')),
              );
            }
          })();
        },
      },
    ]);
  };

  const onList = step === 'list';
  const onPin = step === 'pin';
  const onSearch = step === 'search';
  const onDetails = step === 'details' && lookup;
  const isEditing = Boolean(editing);

  const handleRequestClose = () => {
    if (onDetails || onSearch) goBackToPin();
    else if (onPin) goToList();
    else onClose();
  };

  const title = onDetails
    ? t('menu.addressDetailsTitle')
    : onSearch
      ? t('menu.addressSearchTitle')
      : onPin
        ? isEditing
          ? t('menu.editAddressTitle')
          : t('menu.addressSheetTitle')
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
            onList ? styles.sheetList : styles.sheetFill,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            {onList ? null : (
              <BackButton
                onPress={onDetails || onSearch ? goBackToPin : goToList}
              />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {onSearch ? (
            <PlaceSearchField
              biasLatitude={
                pin?.latitude ?? editing?.lat ?? primaryBranch?.lat
              }
              biasLongitude={
                pin?.longitude ?? editing?.lng ?? primaryBranch?.lng
              }
              onPicked={handlePlacePicked}
            />
          ) : (
            <ScrollView
              style={onList ? styles.listScroll : styles.scroll}
              contentContainerStyle={
                onList ? styles.listScrollContent : styles.scrollContent
              }
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
                    deletingId={
                      deleteAddress.isPending
                        ? (deleteAddress.variables ?? null)
                        : null
                    }
                    onSelect={(address) => void selectAddress(address)}
                    onEdit={startEdit}
                    onDelete={confirmDelete}
                    onAdd={() => {
                      setErrorMessage(null);
                      setEditing(null);
                      setPin(null);
                      setLookup(null);
                      setPickedLookup(null);
                      setStep('pin');
                    }}
                  />
                  <FormError message={errorMessage} />
                </>
              ) : null}

              {onPin ? (
                <View style={styles.pinStep}>
                  <PinMap
                    key={
                      editing
                        ? `edit-${editing.id}`
                        : `add-${visible}`
                    }
                    latitude={
                      pin?.latitude ?? editing?.lat ?? primaryBranch?.lat
                    }
                    longitude={
                      pin?.longitude ?? editing?.lng ?? primaryBranch?.lng
                    }
                    onPinChange={handlePinChange}
                    onSearchPress={openSearch}
                  />
                </View>
              ) : null}

              {onDetails ? (
                <AddressDetailsForm
                  key={
                    editing
                      ? `edit-${editing.id}-${editing.updatedAt}`
                      : `${lookup.lat},${lookup.lng}`
                  }
                  lookup={lookup}
                  saving={
                    editing
                      ? updateAddress.isPending
                      : createAddress.isPending
                  }
                  errorMessage={errorMessage}
                  savedLabel={editing?.label}
                  initialFloor={editing?.line2}
                  initialNotes={editing?.notes}
                  saveLabel={
                    editing ? t('menu.saveAddressChanges') : undefined
                  }
                  onSave={(input) => void saveAddress(input)}
                />
              ) : onPin ? (
                <FormError message={errorMessage} />
              ) : null}
            </ScrollView>
          )}

          {onPin ? (
            <Button
              label={
                keepExistingPin
                  ? t('menu.continueLocation')
                  : t('menu.confirmLocation')
              }
              onPress={() => void confirmPin()}
              loading={!skipGeocode && reverseGeocode.isPending}
              disabled={!skipGeocode && reverseGeocode.isPending}
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
    maxHeight: '92%',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetFill: {
    height: '88%',
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
  listScroll: {
    marginTop: 8,
    maxHeight: 420,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
    gap: 12,
  },
  listScrollContent: {
    gap: 12,
    paddingBottom: 0,
  },
  pinStep: {
    flex: 1,
    minHeight: 280,
    overflow: 'visible',
    zIndex: 2,
  },
  confirmBtn: {
    marginTop: 8,
  },
}));
