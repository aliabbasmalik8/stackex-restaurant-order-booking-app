import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles, useTheme } from '@/theme';

interface BackButtonProps {
  onPress?: () => void;
}

export const BackButton = ({ onPress }: BackButtonProps) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.ink} />
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
}));
