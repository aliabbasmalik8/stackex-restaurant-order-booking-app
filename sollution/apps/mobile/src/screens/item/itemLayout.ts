import type { ViewStyle } from 'react-native';
import { spacing } from '@/theme';

export const ITEM_BP = {
  xs: 320,
  sm: 360,
  md: 414,
  lg: 900,
  xl: 1120,
} as const;

export const CHIP_GAP = spacing.sm;

export type ItemBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ItemQtySize = 'sm' | 'lg';

export type ItemLayout = {
  breakpoint: ItemBreakpoint;
  paddingX: number;
  maxContentWidth: number;
  titleSize: number;
  chipColumns: number;
  chipPadding: number;
  sectionGap: number;
  footerGap: number;
  footerPadY: number;
  heroHeightRatio: number;
  heroAspect: number;
  qtySize: ItemQtySize;
  columnWidth: number;
  innerWidth: number;
  chipWidth: number;
  heroWidth: number;
};

type ItemLayoutTokens = {
  paddingX: number;
  maxContentWidth: number | null;
  titleSize: number;
  chipColumns: number;
  chipPadding: number;
  sectionGap: number;
  footerGap: number;
  footerPadY: number;
  heroHeightRatio: number;
  qtySize: ItemQtySize;
};

const HERO_ASPECT = 16 / 10;

const TOKENS: Record<ItemBreakpoint, ItemLayoutTokens> = {
  xs: {
    paddingX: 12,
    maxContentWidth: null,
    titleSize: 20,
    chipColumns: 1,
    chipPadding: 8,
    sectionGap: 8,
    footerGap: 8,
    footerPadY: 12,
    heroHeightRatio: 0.32,
    qtySize: 'sm',
  },
  sm: {
    paddingX: 16,
    maxContentWidth: null,
    titleSize: 22,
    chipColumns: 2,
    chipPadding: 10,
    sectionGap: 12,
    footerGap: 12,
    footerPadY: 12,
    heroHeightRatio: 0.36,
    qtySize: 'lg',
  },
  md: {
    paddingX: 22,
    maxContentWidth: 564,
    titleSize: 26,
    chipColumns: 2,
    chipPadding: 12,
    sectionGap: 16,
    footerGap: 12,
    footerPadY: 16,
    heroHeightRatio: 0.38,
    qtySize: 'lg',
  },
  lg: {
    paddingX: 28,
    maxContentWidth: 720,
    titleSize: 28,
    chipColumns: 3,
    chipPadding: 14,
    sectionGap: 16,
    footerGap: 16,
    footerPadY: 20,
    heroHeightRatio: 0.38,
    qtySize: 'lg',
  },
  xl: {
    paddingX: 32,
    maxContentWidth: 840,
    titleSize: 28,
    chipColumns: 3,
    chipPadding: 16,
    sectionGap: 20,
    footerGap: 16,
    footerPadY: 24,
    heroHeightRatio: 0.34,
    qtySize: 'lg',
  },
};

export function itemBreakpoint(width: number): ItemBreakpoint {
  if (width < ITEM_BP.sm) return 'xs';
  if (width < ITEM_BP.md) return 'sm';
  if (width < ITEM_BP.lg) return 'md';
  if (width < ITEM_BP.xl) return 'lg';
  return 'xl';
}

export function itemChipWidth(
  innerWidth: number,
  columns: number,
  gap: number = CHIP_GAP,
) {
  if (columns <= 1) return Math.max(0, Math.floor(innerWidth));
  return Math.max(0, Math.floor((innerWidth - gap * (columns - 1)) / columns));
}

export function itemLayoutFromWidth(width: number): ItemLayout {
  const availableWidth = Math.max(0, width);
  const breakpoint = itemBreakpoint(availableWidth);
  const tokens = TOKENS[breakpoint];
  const maxContentWidth = tokens.maxContentWidth ?? availableWidth;
  const columnWidth = Math.min(availableWidth, maxContentWidth);
  const innerWidth = Math.max(0, columnWidth - tokens.paddingX * 2);
  const chipWidth = itemChipWidth(innerWidth, tokens.chipColumns);

  return {
    breakpoint,
    paddingX: tokens.paddingX,
    maxContentWidth,
    titleSize: tokens.titleSize,
    chipColumns: tokens.chipColumns,
    chipPadding: tokens.chipPadding,
    sectionGap: tokens.sectionGap,
    footerGap: tokens.footerGap,
    footerPadY: tokens.footerPadY,
    heroHeightRatio: tokens.heroHeightRatio,
    heroAspect: HERO_ASPECT,
    qtySize: tokens.qtySize,
    columnWidth,
    innerWidth,
    chipWidth,
    heroWidth: innerWidth,
  };
}

export function itemHeroMaxHeight(windowHeight: number, layout: ItemLayout) {
  return Math.min(
    windowHeight * layout.heroHeightRatio,
    layout.heroWidth * (10 / 16),
  );
}

export function itemColumnStyle(columnWidth: number): ViewStyle {
  return {
    width: columnWidth,
    maxWidth: columnWidth,
    alignSelf: 'center',
  };
}

export function itemChipLockStyle(chipWidth: number): ViewStyle {
  return {
    width: chipWidth,
    maxWidth: chipWidth,
    flexBasis: chipWidth,
    flexGrow: 0,
    flexShrink: 0,
  };
}
