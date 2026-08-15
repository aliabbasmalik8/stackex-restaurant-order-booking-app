import { View } from 'react-native';
import { DineOsMark } from './DineOsMark';
import { radii, createStyles, useTheme } from '@/theme';

interface BrandMarkProps {
  size?: number;
}

/** Rounded DineOS D tile used on auth heroes. */
export const BrandMark = ({ size = 56 }: BrandMarkProps) => {
  const { colors } = useTheme();
  const glyph = Math.round(size * 0.58);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="DineOS"
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
        },
      ]}
    >
      <DineOsMark size={glyph} color={colors.onHero} />
    </View>
  );
};

const styles = createStyles((colors) => ({
  tile: {
    backgroundColor: colors.heroGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
}));
