import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';

type EmptyCartIllustrationProps = {
  size?: number;
};

/** Soft empty-bag mark for the cart empty state. */
export const EmptyCartIllustration = ({
  size = 148,
}: EmptyCartIllustrationProps) => {
  const { colors } = useTheme();
  const accent = colors.primary;
  const soft = colors.surface;
  const ink = colors.ink;

  return (
    <Svg width={size} height={size} viewBox="0 0 148 148" fill="none">
      <Circle cx="74" cy="74" r="70" fill={soft} />
      <Circle cx="74" cy="74" r="54" fill={colors.card} />
      {/* Bag body */}
      <Path
        d="M46 58h56l-4.5 52.5a8 8 0 0 1-8 7.5H58.5a8 8 0 0 1-8-7.5L46 58Z"
        fill={accent}
        opacity={0.18}
      />
      <Path
        d="M49 62h50l-3.8 46a6 6 0 0 1-6 5.5H58.8a6 6 0 0 1-6-5.5L49 62Z"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* Handles */}
      <Path
        d="M58 62c0-10 6.5-18 16-18s16 8 16 18"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Empty dashed hint */}
      <Path
        d="M62 88h24"
        stroke={ink}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.18}
      />
      <Path
        d="M66 98h16"
        stroke={ink}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.12}
      />
      {/* Spark accent */}
      <Path
        d="M108 42l1.6 4.4L114 48l-4.4 1.6L108 54l-1.6-4.4L102 48l4.4-1.6L108 42Z"
        fill={accent}
      />
      <Rect
        x="34"
        y="40"
        width="6"
        height="6"
        rx="1.5"
        fill={accent}
        opacity={0.45}
        transform="rotate(18 37 43)"
      />
    </Svg>
  );
};
