import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from '@/components/ui/Text';
import { radii, typography, createStyles, useTheme } from '@/theme';

interface FieldProps extends TextInputProps {
  label: string;
  optionalHint?: string;
}

export const Field = ({
  label,
  optionalHint,
  style,
  ...inputProps
}: FieldProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.block}>
      <Text variant="label" style={styles.label}>
        {label}
        {optionalHint ? (
          <Text style={styles.optional}> {optionalHint}</Text>
        ) : null}
      </Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          inputProps.value ? styles.inputFilled : styles.inputEmpty,
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
};

const styles = createStyles((colors) => ({
  block: { gap: 6 },
  label: { paddingLeft: 6 },
  optional: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  input: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    fontSize: 15,
    color: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  inputFilled: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
  },
  inputEmpty: {
    fontFamily: typography.fontFamilySemiBold,
    fontWeight: typography.fontWeight.semibold,
  },
}));
