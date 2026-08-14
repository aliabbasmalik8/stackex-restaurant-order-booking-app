import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';

type MapPreviewStandInProps = {
  pinned?: boolean;
};

/** Faux street grid — web stand-in until OSM tiles. */
export function MapPreviewStandIn({ pinned = false }: MapPreviewStandInProps) {
  const { colors } = useTheme();
  const paper = colors.surface;
  const road = colors.border;
  const avenue = colors.muted;
  const pin = colors.primary;
  const glow = pinned ? pin : colors.ink;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
      <Rect width="320" height="240" fill={paper} />
      <Rect x="18" y="22" width="88" height="52" rx="8" fill={colors.card} opacity={0.55} />
      <Rect x="214" y="28" width="72" height="64" rx="8" fill={colors.card} opacity={0.4} />
      <Rect x="40" y="132" width="70" height="70" rx="8" fill={colors.card} opacity={0.35} />
      <Rect x="200" y="148" width="96" height="54" rx="8" fill={colors.card} opacity={0.5} />

      <Line x1="0" y1="78" x2="320" y2="78" stroke={avenue} strokeWidth={7} opacity={0.35} />
      <Line x1="0" y1="168" x2="320" y2="168" stroke={avenue} strokeWidth={6} opacity={0.28} />
      <Line x1="112" y1="0" x2="112" y2="240" stroke={avenue} strokeWidth={7} opacity={0.3} />
      <Line x1="228" y1="0" x2="228" y2="240" stroke={road} strokeWidth={5} opacity={0.4} />

      {[36, 54, 96, 120, 144, 192, 216].map((y) => (
        <Line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2="320"
          y2={y}
          stroke={road}
          strokeWidth={1}
          opacity={0.45}
        />
      ))}
      {[48, 80, 148, 180, 260, 292].map((x) => (
        <Line
          key={`v-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="240"
          stroke={road}
          strokeWidth={1}
          opacity={0.4}
        />
      ))}

      <Circle cx="160" cy="118" r={pinned ? 28 : 22} fill={glow} opacity={0.12} />
      <Circle cx="160" cy="118" r="8" fill={colors.card} />
      <Path
        d="M160 96c-9.4 0-17 7.4-17 16.6 0 12.4 17 29.4 17 29.4s17-17 17-29.4C177 103.4 169.4 96 160 96Z"
        fill={pin}
      />
      <Circle cx="160" cy="112.5" r="5" fill={colors.card} />
    </Svg>
    </View>
  );
}
