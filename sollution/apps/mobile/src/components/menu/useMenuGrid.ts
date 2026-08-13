import { useState } from 'react';
import {
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { spacing } from '@/theme';

const MIN_CARD_WIDTH = 160;
const MAX_CARD_WIDTH = 280;
const MIN_COLUMNS = 2;
const GAP = spacing.md;

function cardWidthFor(contentWidth: number, columns: number) {
  return (contentWidth - GAP * (columns - 1)) / columns;
}

export function menuGridFromWidth(contentWidth: number) {
  if (contentWidth <= 0) {
    return { columns: MIN_COLUMNS, cardWidth: 0, gap: GAP };
  }

  let columns = MIN_COLUMNS;
  while (true) {
    const current = cardWidthFor(contentWidth, columns);
    const next = cardWidthFor(contentWidth, columns + 1);
    if (current > MAX_CARD_WIDTH && next >= MIN_CARD_WIDTH) {
      columns += 1;
      continue;
    }
    break;
  }

  return {
    columns,
    cardWidth: cardWidthFor(contentWidth, columns),
    gap: GAP,
  };
}

/** Lock a cell to the computed card width (RN Web ignores `width` without flexBasis). */
export function menuGridCellStyle(cardWidth: number): ViewStyle {
  return {
    width: cardWidth,
    maxWidth: cardWidth,
    flexBasis: cardWidth,
    flexGrow: 0,
    flexShrink: 0,
  };
}

/**
 * Column count + card width from the inner grid row's onLayout width.
 * Attach `onGridLayout` to the row that already sits inside horizontal padding.
 */
export function useMenuGrid() {
  const { width } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(
    Math.max(0, width - spacing.screenX * 2),
  );

  const onGridLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next > 0 && Math.abs(next - contentWidth) > 0.5) {
      setContentWidth(next);
    }
  };

  return { ...menuGridFromWidth(contentWidth), onGridLayout };
}
