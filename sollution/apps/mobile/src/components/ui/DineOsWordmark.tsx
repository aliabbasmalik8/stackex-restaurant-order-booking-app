import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { typography, createStyles, useTheme } from '@/theme';

type DineOsWordmarkProps = {
  fontSize?: number;
};

/** Full DineOS lockup for heroes with room. Glyph color follows `onHero`. */
export const DineOsWordmark = ({ fontSize = 28 }: DineOsWordmarkProps) => {
  const { colors } = useTheme();
  const oSize = Math.round(fontSize * 0.78);
  const inner = Math.max(3, Math.round(oSize * 0.22));

  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="DineOS">
      <Text style={[styles.letters, { fontSize, color: colors.onHero }]}>Dine</Text>
      <View style={[styles.oWrap, { width: oSize, height: fontSize }]}>
        <Svg width={oSize} height={oSize} viewBox="0 0 32 32">
          <Circle
            cx="16"
            cy="16"
            r="13"
            stroke={colors.onHero}
            strokeWidth={3}
            fill="none"
          />
          <Circle cx="16" cy="16" r={inner} fill={colors.onHero} />
        </Svg>
      </View>
      <Text style={[styles.letters, { fontSize, color: colors.onHero }]}>S</Text>
    </View>
  );
};

const styles = createStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letters: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  oWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
