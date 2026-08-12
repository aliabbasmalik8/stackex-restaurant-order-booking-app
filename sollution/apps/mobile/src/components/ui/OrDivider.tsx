import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { typography, createStyles, useTheme } from '@/theme';

interface OrDividerProps {
  label: string;
}

export const OrDivider = ({ label }: OrDividerProps) => {
  useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = createStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth + 0.5,
    backgroundColor: colors.heroRule,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
  },
}));
