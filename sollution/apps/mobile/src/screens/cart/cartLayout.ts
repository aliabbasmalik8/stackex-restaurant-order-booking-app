export const CART_BP = {
  xs: 320,
  sm: 360,
  md: 414,
  lg: 900,
  xl: 1120,
} as const;

export type CartBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type CartLayout = {
  breakpoint: CartBreakpoint;
  paddingX: number;
  titleSize: number;
  thumbSize: number;
  nameSize: number;
  optsSize: number;
  priceSize: number;
  rowPad: number;
  rowGap: number;
  itemGap: number;
  listGap: number;
  addMoreMinHeight: number;
  addMorePlus: number;
  addMoreText: number;
  summaryPadY: number;
  summaryPadX: number;
  summaryLabel: number;
  summaryTotal: number;
  footerPadY: number;
  emptyTitle: number;
  emptyMaxWidth: number;
  emptyArt: number;
  qtySize: 'sm' | 'lg';
};

const TOKENS: Record<CartBreakpoint, Omit<CartLayout, 'breakpoint'>> = {
  xs: {
    paddingX: 12,
    titleSize: 20,
    thumbSize: 72,
    nameSize: 13,
    optsSize: 11,
    priceSize: 12.5,
    rowPad: 8,
    rowGap: 8,
    itemGap: 8,
    listGap: 12,
    addMoreMinHeight: 44,
    addMorePlus: 16,
    addMoreText: 12,
    summaryPadY: 14,
    summaryPadX: 14,
    summaryLabel: 12,
    summaryTotal: 14,
    footerPadY: 12,
    emptyTitle: 14,
    emptyMaxWidth: 240,
    emptyArt: 120,
    qtySize: 'sm',
  },
  sm: {
    paddingX: 16,
    titleSize: 22,
    thumbSize: 80,
    nameSize: 13.5,
    optsSize: 12,
    priceSize: 13,
    rowPad: 8,
    rowGap: 8,
    itemGap: 10,
    listGap: 14,
    addMoreMinHeight: 46,
    addMorePlus: 17,
    addMoreText: 12.5,
    summaryPadY: 15,
    summaryPadX: 16,
    summaryLabel: 12.5,
    summaryTotal: 15,
    footerPadY: 14,
    emptyTitle: 14.5,
    emptyMaxWidth: 260,
    emptyArt: 136,
    qtySize: 'sm',
  },
  md: {
    paddingX: 22,
    titleSize: 25,
    thumbSize: 88,
    nameSize: 14,
    optsSize: 12,
    priceSize: 13.5,
    rowPad: 8,
    rowGap: 8,
    itemGap: 10,
    listGap: 16,
    addMoreMinHeight: 48,
    addMorePlus: 18,
    addMoreText: 13,
    summaryPadY: 16,
    summaryPadX: 18,
    summaryLabel: 13,
    summaryTotal: 15.5,
    footerPadY: 14,
    emptyTitle: 15,
    emptyMaxWidth: 280,
    emptyArt: 148,
    qtySize: 'sm',
  },
  lg: {
    paddingX: 28,
    titleSize: 28,
    thumbSize: 124,
    nameSize: 20,
    optsSize: 16,
    priceSize: 18,
    rowPad: 16,
    rowGap: 14,
    itemGap: 16,
    listGap: 20,
    addMoreMinHeight: 56,
    addMorePlus: 22,
    addMoreText: 16,
    summaryPadY: 22,
    summaryPadX: 24,
    summaryLabel: 16,
    summaryTotal: 20,
    footerPadY: 18,
    emptyTitle: 17,
    emptyMaxWidth: 380,
    emptyArt: 176,
    qtySize: 'lg',
  },
  xl: {
    paddingX: 32,
    titleSize: 30,
    thumbSize: 136,
    nameSize: 22,
    optsSize: 17,
    priceSize: 20,
    rowPad: 18,
    rowGap: 16,
    itemGap: 18,
    listGap: 22,
    addMoreMinHeight: 60,
    addMorePlus: 24,
    addMoreText: 17,
    summaryPadY: 24,
    summaryPadX: 28,
    summaryLabel: 17,
    summaryTotal: 22,
    footerPadY: 20,
    emptyTitle: 18,
    emptyMaxWidth: 420,
    emptyArt: 188,
    qtySize: 'lg',
  },
};

export function cartBreakpoint(width: number): CartBreakpoint {
  if (width < CART_BP.sm) return 'xs';
  if (width < CART_BP.md) return 'sm';
  if (width < CART_BP.lg) return 'md';
  if (width < CART_BP.xl) return 'lg';
  return 'xl';
}

export function cartLayoutFromWidth(width: number): CartLayout {
  const breakpoint = cartBreakpoint(Math.max(0, width));
  return { breakpoint, ...TOKENS[breakpoint] };
}
