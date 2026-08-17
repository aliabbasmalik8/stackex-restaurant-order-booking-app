import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  usePlaceAutocomplete,
  usePlaceDetails,
  type PlacePrediction,
  type ReverseGeocodeResult,
} from '@/api/OrderBooking/modules/addresses';
import { Text } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
import { radii, typography, createStyles, useTheme } from '@/theme';

const DEBOUNCE_MS = 320;

const webInputReset: TextStyle =
  Platform.OS === 'web'
    ? ({
        outlineWidth: 0,
        outlineStyle: 'none',
        outlineColor: 'transparent',
      } as TextStyle)
    : {};

type PlaceSearchFieldProps = {
  biasLatitude?: number | null;
  biasLongitude?: number | null;
  onPicked: (result: ReverseGeocodeResult) => void;
};

function newSessionToken(): string {
  const random =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return random.slice(0, 64);
}

/** Full-sheet Places typeahead. Debounced; min 2 characters. */
export function PlaceSearchField({
  biasLatitude,
  biasLongitude,
  onPicked,
}: PlaceSearchFieldProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const autocomplete = usePlaceAutocomplete();
  const details = usePlaceDetails();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const sessionTokenRef = useRef(newSessionToken());
  const requestIdRef = useRef(0);
  const inputRef = useRef<TextInput>(null);
  const biasRef = useRef({ lat: biasLatitude, lng: biasLongitude });
  const autocompleteMutateRef = useRef(autocomplete.mutateAsync);
  biasRef.current = { lat: biasLatitude, lng: biasLongitude };
  autocompleteMutateRef.current = autocomplete.mutateAsync;

  useEffect(() => {
    const handle = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(handle);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setErrorMessage(null);
      return;
    }

    const handle = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      const { lat, lng } = biasRef.current;
      void (async () => {
        try {
          const rows = await autocompleteMutateRef.current({
            query: trimmed,
            ...(typeof lat === 'number' && typeof lng === 'number'
              ? { lat, lng }
              : {}),
            sessionToken: sessionTokenRef.current,
          });
          if (requestId !== requestIdRef.current) return;
          setPredictions(rows.slice(0, 8));
          setErrorMessage(null);
        } catch (error) {
          if (requestId !== requestIdRef.current) return;
          setPredictions([]);
          setErrorMessage(
            getErrorMessage(error, t('menu.addressSearchFailed')),
          );
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query, t]);

  const pickPlace = async (place: PlacePrediction) => {
    setErrorMessage(null);
    try {
      const result = await details.mutateAsync({
        placeId: place.placeId,
        sessionToken: sessionTokenRef.current,
      });
      sessionTokenRef.current = newSessionToken();
      Keyboard.dismiss();
      onPicked(result);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.addressSearchFailed')));
    }
  };

  const busy = details.isPending;
  const trimmed = query.trim();
  const searching = autocomplete.isPending && trimmed.length >= 2;

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.search, focused && styles.searchFocused]}
      >
        {searching || busy ? (
          <ActivityIndicator size="small" color={colors.muted} />
        ) : (
          <Ionicons name="search" size={16} color={colors.muted} />
        )}
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          editable={!busy}
          autoFocus
          placeholder={t('menu.addressSearchPlaceholder')}
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.searchInput, webInputReset]}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setPredictions([]);
              setErrorMessage(null);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close-circle" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {predictions.map((place) => (
          <Pressable
            key={place.placeId}
            onPress={() => void pickPlace(place)}
            disabled={busy}
            style={[styles.row, busy && styles.rowBusy]}
            accessibilityRole="button"
          >
            <Ionicons name="location-outline" size={18} color={colors.sub} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {place.mainText}
              </Text>
              {place.secondaryText ? (
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {place.secondaryText}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}

        {!searching && !busy && trimmed.length < 2 ? (
          <Text style={styles.hint}>{t('menu.addressSearchHint')}</Text>
        ) : null}

        {!searching &&
        !busy &&
        trimmed.length >= 2 &&
        predictions.length === 0 &&
        !errorMessage ? (
          <Text style={styles.hint}>{t('menu.addressSearchEmpty')}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = createStyles((colors) => ({
  wrap: {
    flex: 1,
    minHeight: 280,
    marginTop: 14,
    gap: 10,
  },
  search: {
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchFocused: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 4,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowBusy: { opacity: 0.55 },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  rowMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  hint: {
    marginTop: 18,
    paddingHorizontal: 4,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 20,
  },
  error: {
    paddingHorizontal: 8,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
}));
