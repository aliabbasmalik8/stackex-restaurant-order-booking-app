import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, radii, typography } from '@/theme';

interface CartBarProps {
  count: number;
  total: number;
  onPress?: () => void;
}

export const CartBar = ({ count, total, onPress }: CartBarProps) => {
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
      <Text style={styles.label}>{t('menu.viewCart')}</Text>
    </View>
    <View style={styles.total}>
      <Text style={styles.totalText}>AED {total}</Text>
    </View>
  </Pressable>
);
};

const styles = StyleSheet.create({
  bar: {
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingLeft: 22,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: { opacity: 0.92 },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  count: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.countText,
  },
  label: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
  total: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  totalText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
});
