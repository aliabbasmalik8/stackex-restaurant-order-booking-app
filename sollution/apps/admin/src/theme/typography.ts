/** Fonts match the mobile guest app: Sora (display) + Manrope (UI). */
export const typography = {
  fontFamilyDisplay: '"Sora", ui-sans-serif, system-ui, sans-serif',
  fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif',

  fontSize: {
    xs: 11,
    sm: 12,
    md: 13.5,
    base: 14,
    lg: 15,
    xl: 16,
    xxl: 26,
    hero: 28,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  letterSpacing: {
    tight: '-0.02em',
    label: '0.04em',
  },
} as const
