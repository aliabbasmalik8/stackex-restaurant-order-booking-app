export const CONFIRMATION_BP = {
  xs: 320,
  sm: 360,
  md: 414,
  lg: 900,
  xl: 1120,
} as const;

export type ConfirmationBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ConfirmationLayout = {
  breakpoint: ConfirmationBreakpoint;
  paddingX: number;
  scrollGap: number;
  heroTopPad: number;
  checkSize: number;
  checkMarkSize: number;
  titleSize: number;
  subSize: number;
  codeCardRadius: number;
  codeCardPad: number;
  codeSize: number;
  codeLineHeight: number;
  codeHintSize: number;
  pillTextSize: number;
  progressLabelSize: number;
  glassPadY: number;
  glassPadX: number;
  glassGap: number;
  locIconSize: number;
  locEmojiSize: number;
  locTitleSize: number;
  locSubSize: number;
  directionsSize: number;
  summaryPadY: number;
  summaryPadX: number;
  summaryTextSize: number;
  metaSize: number;
  paidSize: number;
  footerPadX: number;
  footerPadTop: number;
  backBtnHeight: number;
  backTextSize: number;
};

const TOKENS: Record<ConfirmationBreakpoint, Omit<ConfirmationLayout, 'breakpoint'>> = {
  xs: {
    paddingX: 12,
    scrollGap: 12,
    heroTopPad: 28,
    checkSize: 56,
    checkMarkSize: 24,
    titleSize: 21,
    subSize: 12.5,
    codeCardRadius: 20,
    codeCardPad: 18,
    codeSize: 42,
    codeLineHeight: 48,
    codeHintSize: 11,
    pillTextSize: 12,
    progressLabelSize: 10.5,
    glassPadY: 14,
    glassPadX: 14,
    glassGap: 10,
    locIconSize: 34,
    locEmojiSize: 15,
    locTitleSize: 13,
    locSubSize: 11,
    directionsSize: 11.5,
    summaryPadY: 14,
    summaryPadX: 14,
    summaryTextSize: 12.5,
    metaSize: 11.5,
    paidSize: 13.5,
    footerPadX: 16,
    footerPadTop: 10,
    backBtnHeight: 50,
    backTextSize: 13.5,
  },
  sm: {
    paddingX: 16,
    scrollGap: 13,
    heroTopPad: 32,
    checkSize: 60,
    checkMarkSize: 26,
    titleSize: 23,
    subSize: 13,
    codeCardRadius: 22,
    codeCardPad: 20,
    codeSize: 48,
    codeLineHeight: 54,
    codeHintSize: 11.5,
    pillTextSize: 12.5,
    progressLabelSize: 11,
    glassPadY: 15,
    glassPadX: 16,
    glassGap: 12,
    locIconSize: 38,
    locEmojiSize: 16,
    locTitleSize: 13.5,
    locSubSize: 11.5,
    directionsSize: 12,
    summaryPadY: 15,
    summaryPadX: 16,
    summaryTextSize: 13,
    metaSize: 12,
    paidSize: 14,
    footerPadX: 18,
    footerPadTop: 11,
    backBtnHeight: 52,
    backTextSize: 14,
  },
  md: {
    paddingX: 20,
    scrollGap: 14,
    heroTopPad: 40,
    checkSize: 64,
    checkMarkSize: 28,
    titleSize: 25,
    subSize: 13.5,
    codeCardRadius: 24,
    codeCardPad: 22,
    codeSize: 54,
    codeLineHeight: 62,
    codeHintSize: 12,
    pillTextSize: 13,
    progressLabelSize: 11,
    glassPadY: 16,
    glassPadX: 18,
    glassGap: 13,
    locIconSize: 40,
    locEmojiSize: 17,
    locTitleSize: 14,
    locSubSize: 12,
    directionsSize: 12.5,
    summaryPadY: 16,
    summaryPadX: 18,
    summaryTextSize: 13,
    metaSize: 12,
    paidSize: 14,
    footerPadX: 20,
    footerPadTop: 12,
    backBtnHeight: 54,
    backTextSize: 14.5,
  },
  lg: {
    paddingX: 28,
    scrollGap: 18,
    heroTopPad: 48,
    checkSize: 70,
    checkMarkSize: 30,
    titleSize: 28,
    subSize: 14.5,
    codeCardRadius: 24,
    codeCardPad: 24,
    codeSize: 56,
    codeLineHeight: 64,
    codeHintSize: 12.5,
    pillTextSize: 13.5,
    progressLabelSize: 11.5,
    glassPadY: 18,
    glassPadX: 20,
    glassGap: 14,
    locIconSize: 42,
    locEmojiSize: 18,
    locTitleSize: 15,
    locSubSize: 12.5,
    directionsSize: 13,
    summaryPadY: 18,
    summaryPadX: 20,
    summaryTextSize: 14,
    metaSize: 12.5,
    paidSize: 15,
    footerPadX: 24,
    footerPadTop: 14,
    backBtnHeight: 56,
    backTextSize: 15,
  },
  xl: {
    paddingX: 32,
    scrollGap: 20,
    heroTopPad: 52,
    checkSize: 74,
    checkMarkSize: 32,
    titleSize: 30,
    subSize: 15,
    codeCardRadius: 24,
    codeCardPad: 26,
    codeSize: 58,
    codeLineHeight: 66,
    codeHintSize: 13,
    pillTextSize: 14,
    progressLabelSize: 12,
    glassPadY: 20,
    glassPadX: 22,
    glassGap: 15,
    locIconSize: 44,
    locEmojiSize: 18,
    locTitleSize: 15.5,
    locSubSize: 13,
    directionsSize: 13.5,
    summaryPadY: 20,
    summaryPadX: 22,
    summaryTextSize: 14.5,
    metaSize: 13,
    paidSize: 15.5,
    footerPadX: 28,
    footerPadTop: 16,
    backBtnHeight: 58,
    backTextSize: 15.5,
  },
};

function confirmationBreakpoint(width: number): ConfirmationBreakpoint {
  if (width < CONFIRMATION_BP.sm) return 'xs';
  if (width < CONFIRMATION_BP.md) return 'sm';
  if (width < CONFIRMATION_BP.lg) return 'md';
  if (width < CONFIRMATION_BP.xl) return 'lg';
  return 'xl';
}

export function confirmationLayoutFromWidth(width: number): ConfirmationLayout {
  const breakpoint = confirmationBreakpoint(Math.max(0, width));
  return { breakpoint, ...TOKENS[breakpoint] };
}
