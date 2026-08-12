import { Pressable, View } from 'react-native';
import { radii, createStyles, useTheme } from '@/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

/** Design-matched switch: 40×24 pill, white thumb, uses palette CTA when on. */
export const Toggle = ({ value, onValueChange, disabled }: ToggleProps) => {
  useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        disabled && styles.trackDisabled,
      ]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  track: {
    width: 40,
    height: 24,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.primary,
  },
  trackOff: {
    backgroundColor: colors.border,
  },
  trackDisabled: {
    opacity: 0.55,
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  thumbOn: {
    alignSelf: 'flex-end',
    marginRight: 3,
  },
  thumbOff: {
    alignSelf: 'flex-start',
    marginLeft: 3,
  },
}));
