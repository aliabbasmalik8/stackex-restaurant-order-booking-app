import { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { colors, radii, typography } from '@/theme';

const LENGTH = 4;

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
}

export const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const refs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === index ? cleaned : d));
    onChange(next.join(''));
    if (cleaned && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChangeText={(t) => setDigit(index, t)}
          onKeyPress={(e) => onKeyPress(index, e)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          style={[styles.cell, digit ? styles.cellFilled : null]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    textAlign: 'center',
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cellFilled: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});
