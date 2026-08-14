import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';

/** Kitchen pin until the user picks their own. */
const DEFAULT_REGION = {
  latitude: 25.2365,
  longitude: 55.2784,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/** Native map + disabled search / my-location (logic later). */
export function PinMap() {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          toolbarEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: DEFAULT_REGION.latitude,
              longitude: DEFAULT_REGION.longitude,
            }}
          />
        </MapView>

        <Pressable
          disabled
          style={styles.locationBtn}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityLabel={t('menu.useMyLocation')}
        >
          <Ionicons name="locate-outline" size={20} color={colors.ink} />
          <Text style={styles.locationLabel}>{t('menu.useMyLocation')}</Text>
        </Pressable>
      </View>
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
    opacity: 0.55,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  locationLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
}));
