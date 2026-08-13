import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';

type CartIconButtonProps = {
  count?: number;
  onPress?: () => void;
  /** Light icon on dark hero (menu). */
  tone?: 'hero' | 'light';
  accessibilityLabel?: string;
};

/**
 * Header cart control with optional badge count.
 */
export function CartIconButton({
  count = 0,
  onPress,
  tone = 'light',
  accessibilityLabel = 'Cart',
}: CartIconButtonProps) {
  const { colors } = useTheme();
  const hero = tone === 'hero';
  const showBadge = count > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        hero ? styles.btnHero : styles.btnLight,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="cart-outline"
        size={20}
        color={hero ? colors.onHero : colors.ink}
      />
      {showBadge ? (
        <View style={[styles.badge, hero ? styles.badgeHero : styles.badgeLight]}>
          <Text style={[styles.badgeText, hero && styles.badgeTextHero]}>
            {count > 99 ? '99+' : String(count)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = createStyles((colors) => ({
  btn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnHero: {
    backgroundColor: colors.heroGlass,
  },
  btnLight: {
    backgroundColor: colors.card,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: { opacity: 0.88 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeHero: {
    backgroundColor: colors.badgeBg,
  },
  badgeLight: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
    lineHeight: 12,
  },
  badgeTextHero: {
    color: colors.badgeText,
  },
}));
