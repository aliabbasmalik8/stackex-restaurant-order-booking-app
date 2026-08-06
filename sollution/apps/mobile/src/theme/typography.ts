export const typography = {
  /** Display / headlines — Sora */
  fontFamilyDisplay: 'Sora_700Bold',
  fontFamilyDisplaySemiBold: 'Sora_600SemiBold',

  /** UI body — Manrope */
  fontFamily: 'Manrope_400Regular',
  fontFamilyMedium: 'Manrope_500Medium',
  fontFamilySemiBold: 'Manrope_600SemiBold',
  fontFamilyBold: 'Manrope_700Bold',
  fontFamilyExtraBold: 'Manrope_800ExtraBold',

  fontSize: {
    xs: 11,
    sm: 12,
    md: 13.5,
    base: 14,
    lg: 15,
    xl: 16,
    xxl: 26,
    hero: 28,
    watermark: 130,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  letterSpacing: {
    tight: -0.5,
    label: 0.4,
  },
};
