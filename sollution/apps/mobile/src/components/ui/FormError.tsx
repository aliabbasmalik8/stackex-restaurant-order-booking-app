import { type StyleProp, type TextStyle } from 'react-native';
import { Text } from './Text';
import { typography, createStyles, useTheme } from '@/theme';

type FormErrorProps = {
  message?: string | null;
  /** `onHero` for dark auth surfaces. */
  tone?: 'default' | 'onHero';
  style?: StyleProp<TextStyle>;
};

/**
 * Inline action / form error (checkout, profile save, auth, …).
 * Uses semantic error color — not link/accent.
 */
export function FormError({
  message,
  tone = 'default',
  style,
}: FormErrorProps) {
  useTheme();
  if (!message) return null;
  return (
    <Text
      style={[
        styles.error,
        tone === 'onHero' ? styles.onHero : null,
        style,
      ]}
    >
      {message}
    </Text>
  );
}

const styles = createStyles((colors) => ({
  error: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 18,
  },
  onHero: {
    color: '#ffb4ab',
  },
}));
