import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { typography, createStyles, useTheme } from '@/theme';

type SignInMethodRowProps = {
  label: string;
  hint?: string | null;
  actionLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  last?: boolean;
};

export function SignInMethodRow({
  label,
  hint,
  actionLabel,
  onPress,
  disabled,
  last,
}: SignInMethodRowProps) {
  useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      disabled={disabled || !onPress}
      style={[
        styles.row,
        last && styles.rowLast,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={[styles.action, disabled && styles.actionMuted]}>
        {actionLabel}
      </Text>
    </Pressable>
  );
}

const styles = createStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  disabled: { opacity: 0.7 },
  copy: { flex: 1, gap: 2 },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  action: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  actionMuted: {
    color: colors.muted,
  },
}));
