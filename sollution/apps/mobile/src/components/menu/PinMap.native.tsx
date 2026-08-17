import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FormError, Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';
import { getCurrentPin } from './getCurrentPin';
import {
  regionFromBranchPin,
  type PinMapProps,
} from './PinMap.types';

const MY_LOCATION_DELTA = 0.01;

/** Native map: pan to aim a fixed center pin. Search stays disabled. */
export function PinMap({ latitude, longitude, onPinChange }: PinMapProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const initialRegion = regionFromBranchPin(latitude, longitude);
  const [pin, setPin] = useState({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;

  useEffect(() => {
    onPinChangeRef.current?.(pin);
  }, [pin]);

  const applyRegion = (region: Region) => {
    setPin({ latitude: region.latitude, longitude: region.longitude });
  };

  const goToMyLocation = async () => {
    if (locating) return;
    setLocating(true);
    setErrorMessage(null);
    try {
      const result = await getCurrentPin();
      if (!result.ok) {
        setErrorMessage(
          t(
            result.reason === 'denied'
              ? 'menu.locationDenied'
              : 'menu.locationUnavailable',
          ),
        );
        return;
      }
      const next = {
        latitude: result.pin.latitude,
        longitude: result.pin.longitude,
        latitudeDelta: MY_LOCATION_DELTA,
        longitudeDelta: MY_LOCATION_DELTA,
      };
      setPin({ latitude: next.latitude, longitude: next.longitude });
      mapRef.current?.animateToRegion(next, 400);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.search}>
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput
          editable={false}
          placeholder={t('menu.addressSearchPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.mapWrap}>
        <MapView
          key={`${initialRegion.latitude},${initialRegion.longitude}`}
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          toolbarEnabled={false}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={applyRegion}
        />

        <View pointerEvents="none" style={styles.centerPin}>
          <Ionicons name="location" size={40} color={colors.primary} />
        </View>

        <Pressable
          onPress={() => void goToMyLocation()}
          disabled={locating}
          style={[styles.locationBtn, locating && styles.locationBtnBusy]}
          accessibilityRole="button"
          accessibilityState={{ disabled: locating, busy: locating }}
          accessibilityLabel={t('menu.useMyLocation')}
        >
          {locating ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Ionicons name="locate-outline" size={20} color={colors.ink} />
          )}
          <Text style={styles.locationLabel}>{t('menu.useMyLocation')}</Text>
        </Pressable>
      </View>

      <FormError message={errorMessage} />
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    minHeight: 280,
    marginTop: 14,
    gap: 10,
  },
  search: {
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.55,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    paddingVertical: 0,
  },
  mapWrap: {
    flex: 1,
    minHeight: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  centerPin: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  locationBtn: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  locationBtnBusy: { opacity: 0.7 },
  locationLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
}));
