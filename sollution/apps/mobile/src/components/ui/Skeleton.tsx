import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, createStyles, useTheme } from '@/theme';

type SkeletonPulse = Animated.Value;

const SkeletonPulseContext = createContext<SkeletonPulse | null>(null);

type SkeletonGroupProps = {
  children: ReactNode;
  /** Pulse cycle duration (ms) for each half of the loop. */
  duration?: number;
};

/**
 * Shares one pulse animation across nested `Skeleton` bones (MUI-style sync).
 */
export function SkeletonGroup({
  children,
  duration = 850,
}: SkeletonGroupProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, pulse]);

  return (
    <SkeletonPulseContext.Provider value={pulse}>
      {children}
    </SkeletonPulseContext.Provider>
  );
}

export type SkeletonProps = {
  width?: number | `${number}%` | '100%';
  height?: number;
  /** Border radius — number or theme key via `radii`. Default: `radii.md`. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Gray placeholder bone with a soft pulse (use inside `SkeletonGroup` when possible).
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = radii.md,
  style,
}: SkeletonProps) {
  useTheme();
  const shared = useContext(SkeletonPulseContext);
  const local = useRef(new Animated.Value(0)).current;
  const pulse = shared ?? local;

  useEffect(() => {
    if (shared) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(local, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(local, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [local, shared]);

  const opacity = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.42, 0.92],
      }),
    [pulse],
  );

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        styles.bone,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  lastWidth?: number | `${number}%`;
  lineHeight?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/** Stack of text-line bones. */
export function SkeletonText({
  lines = 2,
  lastWidth = '60%',
  lineHeight = 12,
  gap = 8,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textStack, { gap }, style]}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastWidth : '100%'}
          radius={radii.sm}
        />
      ))}
    </View>
  );
}

const styles = createStyles((colors) => ({
  bone: {
    backgroundColor: colors.placeholder,
    overflow: 'hidden',
  },
  textStack: {
    width: '100%',
  },
}));
