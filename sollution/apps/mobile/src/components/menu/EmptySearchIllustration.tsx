import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radii, useTheme } from '@/theme';

type EmptySearchIllustrationProps = {
  size?: number;
};

export const EmptySearchIllustration = ({
  size = 80,
}: EmptySearchIllustrationProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.round,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <MaterialIcons
        name="no-meals"
        size={Math.round(size * 0.5)}
        color={colors.sub}
      />
    </View>
  );
};
