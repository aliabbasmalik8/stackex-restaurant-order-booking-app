import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { colors, radii, typography } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export const Checkbox = ({ checked, onChange, label }: CheckboxProps) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    onPress={() => onChange(!checked)}
    style={styles.row}
  >
    <View style={[styles.box, checked && styles.boxChecked]}>
      {checked ? <Text style={styles.check}>✓</Text> : null}
    </View>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    color: colors.onPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 16,
  },
  label: {
    flex: 1,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
