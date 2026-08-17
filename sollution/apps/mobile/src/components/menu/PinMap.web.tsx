import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FormError, Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';
import { getCurrentPin, type MapPin } from './getCurrentPin';
import { MapPreviewStandIn } from './MapPreviewStandIn';
import type { PinMapProps } from './PinMap.types';

function formatCoord(value: number): string {
  return value.toFixed(5);
}

/** Web: GPS, or a saved pin when editing. No live map tiles. */
export function PinMap({ latitude, longitude, onPinChange }: PinMapProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [pin, setPin] = useState<MapPin | null>(() => {
    if (
      typeof latitude === 'number' &&
      Number.isFinite(latitude) &&
      typeof longitude === 'number' &&
      Number.isFinite(longitude)
    ) {
      return { latitude, longitude };
    }
    return null;
  });
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;

  useEffect(() => {
    if (pin) onPinChangeRef.current?.(pin);
  }, [pin]);

  const captureLocation = async () => {
    if (locating) return;
    setLocating(true);
    setErrorMessage(null);
    try {
      const result = await getCurrentPin();
      if (!result.ok) {
        setPin(null);
        setErrorMessage(
          t(
            result.reason === 'denied'
              ? 'menu.locationDenied'
              : 'menu.locationUnavailable',
          ),
        );
        return;
      }
      setPin(result.pin);
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
        <MapPreviewStandIn pinned={Boolean(pin)} />

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.caption}>
            <Text style={styles.title}>{t('menu.mapPreviewUnavailable')}</Text>
            <Text style={styles.hint}>{t('menu.mapPreviewHint')}</Text>
            {pin ? (
              <Text style={styles.coords}>
                {t('menu.locationSet', {
                  lat: formatCoord(pin.latitude),
                  lng: formatCoord(pin.longitude),
                })}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={() => void captureLocation()}
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
    minHeight: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
  },
  caption: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.card,
    gap: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 17,
  },
  coords: {
    marginTop: 4,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary,
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
