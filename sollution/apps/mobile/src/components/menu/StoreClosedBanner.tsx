import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useStoreAvailability } from '@/core/settings';
import { radii, typography } from '@/theme';

type StoreClosedBannerProps = {
  /** Compact bar for footers / tight layouts */
  compact?: boolean;
};

/** Shown when the store is closed — does not replace the menu. */
export function StoreClosedBanner({ compact = false }: StoreClosedBannerProps) {
  const { isClosed, closedMessage } = useStoreAvailability();
  if (!isClosed) return null;

  return (
    <View
      style={[styles.banner, compact && styles.compact]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="time-outline" size={compact ? 16 : 18} color="#92400E" />
      <Text style={[styles.text, compact && styles.textCompact]}>
        {closedMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  compact: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    flexShrink: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: '#92400E',
    lineHeight: 19,
  },
  textCompact: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});
