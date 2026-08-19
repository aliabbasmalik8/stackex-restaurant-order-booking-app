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
    titleSize: 24,
    thumbSize: 84,
    nameSize: 14.5,
    optsSize: 12.5,
    priceSize: 14,
    rowPad: 10,
    rowGap: 10,
    itemGap: 12,
    listGap: 16,
    addMoreMinHeight: 48,
    addMorePlus: 18,
    addMoreText: 13,
    summaryPadY: 16,
    summaryPadX: 20,
    summaryLabel: 13.5,
    summaryTotal: 16,
    footerPadY: 14,
    emptyTitle: 15,
    emptyMaxWidth: 340,
    emptyArt: 148,
    qtySize: 'sm',
  },
  xl: {
    paddingX: 32,
    titleSize: 26,
    thumbSize: 90,
    nameSize: 15,
    optsSize: 13,
    priceSize: 14.5,
    rowPad: 12,
    rowGap: 12,
    itemGap: 14,
    listGap: 18,
    addMoreMinHeight: 50,
    addMorePlus: 20,
    addMoreText: 14,
    summaryPadY: 18,
    summaryPadX: 22,
    summaryLabel: 14,
    summaryTotal: 17,
    footerPadY: 16,
    emptyTitle: 16,
    emptyMaxWidth: 380,
    emptyArt: 160,
    qtySize: 'sm',
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
