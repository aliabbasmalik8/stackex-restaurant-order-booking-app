import type { ReactNode } from 'react';
import { Pressable, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/Text';
import { radii, typography, createStyles, useTheme } from '@/theme';

type Variant = 'primary' | 'social';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  leftSlot?: ReactNode;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  leftSlot,
}: ButtonProps) => {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const isSocial = variant === 'social';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSocial && styles.social,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.onHero} />
      ) : (
        <>
          {leftSlot}
          <Text
            style={[
              styles.label,
              isPrimary && styles.primaryLabel,
              isSocial && styles.socialLabel,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  base: {
    height: 58,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  social: {
    height: 52,
    backgroundColor: colors.heroGlassFill,
    borderWidth: 1.5,
    borderColor: colors.heroGlassBorder,
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88 },
  label: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
  },
  primaryLabel: { color: colors.onPrimary },
  socialLabel: {
    color: colors.onHero,
    fontSize: 14,
  },
}));