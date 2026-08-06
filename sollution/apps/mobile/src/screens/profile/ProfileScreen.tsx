import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { brand, colors, spacing } from '@/theme';

/** Lightweight placeholder until Profile flow is built. */
export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text variant="title" style={styles.title}>
        Profile
      </Text>
      <Text variant="subtitle" color={colors.textSecondary}>
        Account settings for {brand.name} will live here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenX,
    gap: 8,
  },
  title: {
    letterSpacing: -0.4,
  },
});
