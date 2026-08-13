import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { radii, spacing,typography, createStyles, useTheme } from '@/theme';
import { money } from '@/utils/money';

interface CartBarProps {
  count: number;
  total: number;
  onPress?: () => void;
}

export const CartBar = ({ count, total, onPress }: CartBarProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
  >
    <View style={styles.left}>
      <View style={styles.count}>
        <Text style={styles.countText}>{count}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {t('menu.viewCart')}
      </Text>
    </View>
    <View style={styles.total}>
      <Text style={styles.totalText}>{money(total)}</Text>
    </View>
  </Pressable>
);
};

const styles = createStyles((colors) => ({
  bar: {
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    shadowColor: colors.primaryShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  pressed: { opacity: 0.92 },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  count: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.countText,
  },
  label: {
    flexShrink: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
  total: {
    backgroundColor: colors.onPrimaryGlass,
    borderRadius: radii.pill,
    flexShrink: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  totalText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
}));
