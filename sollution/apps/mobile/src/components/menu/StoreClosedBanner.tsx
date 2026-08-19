import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useStoreAvailability } from '@/core/settings';
import { colors, radii, spacing, typography } from '@/theme';

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
      <Ionicons
        name="time-outline"
        size={compact ? 16 : 18}
        color={colors.warningText}
      />
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
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  compact: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    flexShrink: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warningText,
    lineHeight: 19,
  },
  textCompact: {
    fontSize: typography.fontSize.sm,
    lineHeight: 17,
  },
});
