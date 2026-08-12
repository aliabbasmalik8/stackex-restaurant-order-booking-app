import React from 'react';
import { Text as RNText, TextStyle, StyleProp } from 'react-native';
import { typography, createStyles, useTheme } from '@/theme';

type Variant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'link';

interface TextProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: typography.fontSize.hero,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 21,
  },
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
  },
  bodyStrong: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  caption: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
    textTransform: 'uppercase',
  },
  link: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
};

export const Text = ({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
}: TextProps) => {
  const { colors } = useTheme();
  const variantColor =
    variant === 'label'
      ? colors.textSecondary
      : variant === 'link'
        ? colors.link
        : undefined;

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        variantColor ? { color: variantColor } : null,
        color ? { color } : null,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
};

const styles = createStyles((colors) => ({
  base: { color: colors.text },
}));
