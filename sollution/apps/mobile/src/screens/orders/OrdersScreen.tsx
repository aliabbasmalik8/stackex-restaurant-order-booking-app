import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

/** Lightweight placeholder until Orders flow is built. */
export const OrdersScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text variant="title" style={styles.title}>
        Orders
      </Text>
      <Text variant="subtitle" color={colors.textSecondary}>
        Your active and past pickup orders will show up here.
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
