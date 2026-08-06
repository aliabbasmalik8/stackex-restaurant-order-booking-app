import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Text } from '@/components/ui/Text';
import { brand, colors, radii, typography } from '@/theme';

type Variant = 'hero' | 'surface';

interface PhoneFieldProps extends Omit<TextInputProps, 'style'> {
  dialCode?: string;
  dialFlag?: string;
  /** hero = elevated on dark auth; surface = soft card on light pages */
  variant?: Variant;
  label?: string;
}

export const PhoneField = ({
  dialCode = brand.dialCode,
  dialFlag = brand.dialFlag,
  variant = 'hero',
  label,
  ...inputProps
}: PhoneFieldProps) => (
  <View style={styles.block}>
    {label ? <Text variant="label" style={styles.label}>{label}</Text> : null}
    <View style={[styles.wrap, variant === 'surface' && styles.wrapSurface]}>
      <View style={styles.prefix}>
        <Text style={styles.prefixText}>
          {dialFlag} {dialCode}
        </Text>
      </View>
      <TextInput
        keyboardType="phone-pad"
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...inputProps}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  block: { gap: 6 },
  label: { paddingLeft: 6 },
  wrap: {
    height: 58,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
  },
  wrapSurface: {
    height: 56,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  prefix: {
    borderRightWidth: 1.5,
    borderRightColor: colors.divider,
    paddingRight: 12,
  },
  prefixText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    paddingVertical: 0,
  },
});
