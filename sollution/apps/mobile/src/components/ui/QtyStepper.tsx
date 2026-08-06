import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors, radii, typography } from '@/theme';

type Size = 'lg' | 'sm';

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  size?: Size;
}

export const QtyStepper = ({
  value,
  onChange,
  min = 1,
  size = 'lg',
}: QtyStepperProps) => {
  const canDec = value > min;
  const isSm = size === 'sm';

  return (
    <View style={[styles.wrap, isSm && styles.wrapSm]}>
      <Pressable
        onPress={() => canDec && onChange(value - 1)}
        hitSlop={8}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Text style={[styles.symbol, isSm && styles.symbolSm, !canDec && styles.disabled]}>
          −
        </Text>
      </Pressable>
      <Text style={[styles.value, isSm && styles.valueSm]}>{value}</Text>
      <Pressable
        onPress={() => onChange(value + 1)}
        hitSlop={8}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Text style={[styles.symbol, isSm && styles.symbolSm, styles.plus]}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    height: 56,
    paddingHorizontal: 17,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  wrapSm: {
    height: 34,
    gap: 11,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  btn: { minWidth: 18, alignItems: 'center' },
  symbol: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  symbolSm: {
    fontSize: 16,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
  },
  plus: { color: colors.ink },
  disabled: { opacity: 0.45 },
  value: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    minWidth: 12,
    textAlign: 'center',
  },
  valueSm: { fontSize: 13.5 },
});
