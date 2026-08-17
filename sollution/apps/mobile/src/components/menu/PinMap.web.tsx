import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FormError, Text } from '@/components/ui';
import {
  getGoogleMapsWebKey,
  loadGoogleMapsJs,
} from '@/lib/googleMapsWeb';
import { radii, typography, createStyles, useTheme } from '@/theme';
import { getCurrentPin } from './getCurrentPin';
import { MapPreviewStandIn } from './MapPreviewStandIn';
import {
  regionFromBranchPin,
  type PinMapProps,
} from './PinMap.types';

const MY_LOCATION_ZOOM = 16;

type MapHandle = {
  panTo: (lat: number, lng: number) => void;
};

function asMapHost(node: unknown): HTMLDivElement | null {
  if (!node) return null;
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) {
    return node as HTMLDivElement;
  }
  const maybe = node as {
    _nativeNode?: HTMLElement;
    getNode?: () => HTMLElement;
  };
  const el = maybe._nativeNode ?? maybe.getNode?.();
  return el instanceof HTMLElement ? (el as HTMLDivElement) : null;
}

function MapHost({
  hostRef,
}: {
  hostRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <View
      collapsable={false}
      style={StyleSheet.absoluteFill}
      ref={(node) => {
        hostRef.current = asMapHost(node);
      }}
    />
  );
}

function WebGoogleMap({
  latitude,
  longitude,
  onReady,
  onPinChange,
}: {
  latitude: number;
  longitude: number;
  onReady: (handle: MapHandle | null) => void;
  onPinChange: (pin: { latitude: number; longitude: number }) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  const onReadyRef = useRef(onReady);
  onPinChangeRef.current = onPinChange;
  onReadyRef.current = onReady;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const apiKey = getGoogleMapsWebKey();

  useEffect(() => {
    let cancelled = false;
    let idleListener: { remove: () => void } | null = null;

    void (async () => {
      try {
        await loadGoogleMapsJs(apiKey);
        if (cancelled || !hostRef.current || !window.google?.maps?.Map) {
          throw new Error('Google Maps JS missing');
        }
        const map = new window.google.maps.Map(hostRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: MY_LOCATION_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
          keyboardShortcuts: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        });
        const handle: MapHandle = {
          panTo: (lat, lng) => {
            map.panTo({ lat, lng });
            map.setZoom(MY_LOCATION_ZOOM);
          },
        };
        idleListener = map.addListener('idle', () => {
          const center = map.getCenter();
          if (!center) return;
          onPinChangeRef.current({
            latitude: center.lat(),
            longitude: center.lng(),
          });
        });
        if (cancelled) return;
        onReadyRef.current(handle);
        setReady(true);
      } catch {
        if (!cancelled) {
          onReadyRef.current(null);
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      idleListener?.remove();
      onReadyRef.current(null);
    };
    // Parent remounts PinMap after search with a new initial pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapHost hostRef={hostRef} />
      {failed ? <MapPreviewStandIn pinned /> : null}
      {!ready && !failed ? (
        <View style={styles.mapBusy} pointerEvents="none">
          <ActivityIndicator />
        </View>
      ) : null}
    </View>
  );
}

/** Web: Google Maps JS when `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` is set. */
export function PinMap({
  latitude,
  longitude,
  onPinChange,
  onSearchPress,
}: PinMapProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const apiKey = getGoogleMapsWebKey();
  const initial = regionFromBranchPin(latitude, longitude);
  const [pin, setPin] = useState({
    latitude: initial.latitude,
    longitude: initial.longitude,
  });
  const [locating, setLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mapHandleRef = useRef<MapHandle | null>(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;

  useEffect(() => {
    onPinChangeRef.current?.(pin);
  }, [pin]);

  const flyTo = (nextLat: number, nextLng: number) => {
    setPin({ latitude: nextLat, longitude: nextLng });
    mapHandleRef.current?.panTo(nextLat, nextLng);
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
      flyTo(result.pin.latitude, result.pin.longitude);
    } finally {
      setLocating(false);
    }
  };

  const showLiveMap = Boolean(apiKey);

  return (
    <View style={styles.root}>
      <Pressable
        onPress={onSearchPress}
        style={styles.search}
        accessibilityRole="button"
        accessibilityLabel={t('menu.addressSearchPlaceholder')}
      >
        <Ionicons name="search" size={16} color={colors.muted} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          {t('menu.addressSearchPlaceholder')}
        </Text>
      </Pressable>

      <View style={styles.mapWrap}>
        {showLiveMap ? (
          <WebGoogleMap
            latitude={pin.latitude}
            longitude={pin.longitude}
            onReady={(handle) => {
              mapHandleRef.current = handle;
            }}
            onPinChange={setPin}
          />
        ) : (
          <MapPreviewStandIn pinned />
        )}

        <View pointerEvents="none" style={styles.centerPin}>
          <Ionicons name="location" size={40} color={colors.primary} />
        </View>

        {!showLiveMap ? (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.caption}>
              <Text style={styles.title}>{t('menu.mapPreviewUnavailable')}</Text>
              <Text style={styles.hint}>{t('menu.mapPreviewHint')}</Text>
            </View>
          </View>
        ) : null}

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
    overflow: 'visible',
    zIndex: 2,
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
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
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
  mapBusy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  centerPin: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
