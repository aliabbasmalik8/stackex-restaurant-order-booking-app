import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { brand, colors, radii, typography } from '@/theme';

interface BrandMarkProps {
  size?: number;
  letter?: string;
}

/** Rounded monogram tile used on auth heroes and headers. */
export const BrandMark = ({
  size = 56,
  letter = brand.monogram,
}: BrandMarkProps) => (
  <View
    style={[
      styles.tile,
      {
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
      },
    ]}
  >
    <Text style={[styles.letter, { fontSize: Math.round(size * 0.4) }]}>
      {letter}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.heroGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  letter: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
  },
});
