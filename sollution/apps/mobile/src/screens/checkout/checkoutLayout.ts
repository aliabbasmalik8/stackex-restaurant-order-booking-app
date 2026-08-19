export const CHECKOUT_BP = {
  xs: 320,
  sm: 360,
  md: 414,
  lg: 900,
  xl: 1120,
} as const;

export type CheckoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type CheckoutLayout = {
  breakpoint: CheckoutBreakpoint;
  paddingX: number;
  titleSize: number;
  bodyGap: number;
  bodyPadTop: number;
  sectionGap: number;
  sectionTitleSize: number;
  editLinkSize: number;
  labelSize: number;
  valueSize: number;
  rowPadY: number;
  rowPadX: number;
  summaryStripPadY: number;
  summaryStripSize: number;
  hintSize: number;
  togglePadY: number;
  footerPadX: number;
  footerPadY: number;
  footerLabelSize: number;
  footerAmountSize: number;
  summaryRowPadY: number;
  summaryRowPadX: number;
};

const TOKENS: Record<CheckoutBreakpoint, Omit<CheckoutLayout, 'breakpoint'>> = {
  xs: {
    paddingX: 12,
    titleSize: 17,
    bodyGap: 16,
    bodyPadTop: 18,
    sectionGap: 8,
    sectionTitleSize: 13.5,
    editLinkSize: 11.5,
    labelSize: 12.5,
    valueSize: 13,
    rowPadY: 13,
    rowPadX: 14,
    summaryStripPadY: 10,
    summaryStripSize: 12.5,
    hintSize: 11,
    togglePadY: 12,
    footerPadX: 14,
    footerPadY: 10,
    footerLabelSize: 12.5,
    footerAmountSize: 12.5,
    summaryRowPadY: 10,
    summaryRowPadX: 14,
  },
  sm: {
    paddingX: 16,
    titleSize: 18,
    bodyGap: 18,
    bodyPadTop: 20,
    sectionGap: 10,
    sectionTitleSize: 14,
    editLinkSize: 12,
    labelSize: 13,
    valueSize: 13.5,
    rowPadY: 14,
    rowPadX: 16,
    summaryStripPadY: 11,
    summaryStripSize: 13,
    hintSize: 11,
    togglePadY: 13,
    footerPadX: 18,
    footerPadY: 11,
    footerLabelSize: 13,
    footerAmountSize: 13,
    summaryRowPadY: 11,
    summaryRowPadX: 15,
  },
  md: {
    paddingX: 22,
    titleSize: 19,
    bodyGap: 20,
    bodyPadTop: 22,
    sectionGap: 10,
    sectionTitleSize: 14.5,
    editLinkSize: 12.5,
    labelSize: 13.5,
    valueSize: 14,
    rowPadY: 15,
    rowPadX: 17,
    summaryStripPadY: 12,
    summaryStripSize: 13.5,
    hintSize: 11.5,
    togglePadY: 14,
    footerPadX: 20,
    footerPadY: 12,
    footerLabelSize: 13.5,
    footerAmountSize: 13.5,
    summaryRowPadY: 12,
    summaryRowPadX: 16,
  },
  lg: {
    paddingX: 32,
    titleSize: 24,
    bodyGap: 26,
    bodyPadTop: 28,
    sectionGap: 14,
    sectionTitleSize: 18,
    editLinkSize: 15,
    labelSize: 16,
    valueSize: 17,
    rowPadY: 20,
    rowPadX: 22,
    summaryStripPadY: 16,
    summaryStripSize: 16,
    hintSize: 13.5,
    togglePadY: 18,
    footerPadX: 28,
    footerPadY: 16,
    footerLabelSize: 16,
    footerAmountSize: 16,
    summaryRowPadY: 16,
    summaryRowPadX: 22,
  },
  xl: {
    paddingX: 36,
    titleSize: 26,
    bodyGap: 30,
    bodyPadTop: 32,
    sectionGap: 16,
    sectionTitleSize: 20,
    editLinkSize: 16,
    labelSize: 17,
    valueSize: 18,
    rowPadY: 22,
    rowPadX: 26,
    summaryStripPadY: 18,
    summaryStripSize: 17,
    hintSize: 14,
    togglePadY: 20,
    footerPadX: 32,
    footerPadY: 18,
    footerLabelSize: 17,
    footerAmountSize: 17,
    summaryRowPadY: 18,
    summaryRowPadX: 26,
  },
};

function checkoutBreakpoint(width: number): CheckoutBreakpoint {
  if (width < CHECKOUT_BP.sm) return 'xs';
  if (width < CHECKOUT_BP.md) return 'sm';
  if (width < CHECKOUT_BP.lg) return 'md';
  if (width < CHECKOUT_BP.xl) return 'lg';
  return 'xl';
}

export function checkoutLayoutFromWidth(width: number): CheckoutLayout {
  const breakpoint = checkoutBreakpoint(Math.max(0, width));
  return { breakpoint, ...TOKENS[breakpoint] };
}
