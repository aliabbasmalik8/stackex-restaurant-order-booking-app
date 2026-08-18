import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonGroup, SkeletonText } from '@/components/ui/Skeleton';
import {
  menuGridCellStyle,
  useMenuGrid,
} from '@/components/menu/useMenuGrid';
import { radii, spacing, createStyles, useTheme } from '@/theme';

type MenuSkeletonProps = {
  /** How many grid card placeholders. Defaults to two rows of the current column count. */
  itemCount?: number;
  /** Show featured banner bone. Default true. */
  featured?: boolean;
  /** Category chip count. Default 5. */
  chipCount?: number;
};

/**
 * Menu-shaped skeleton — chips + featured + item grid.
 * Keeps the screen filled while catalog loads.
 */
export function MenuSkeleton({
  itemCount,
  featured = true,
  chipCount = 5,
}: MenuSkeletonProps) {
  useTheme();

  const { columns, cardWidth, onGridLayout } = useMenuGrid();
  const placeholders = itemCount ?? columns * 2;

  return (
    <SkeletonGroup>
      <View style={styles.root} accessibilityLabel="Loading menu">
        <View style={styles.chips}>
          {Array.from({ length: chipCount }, (_, i) => (
            <Skeleton
              key={i}
              width={i === 0 ? 56 : 72 + (i % 3) * 10}
              height={34}
              radius={radii.pill}
            />
          ))}
        </View>

        <View style={styles.grid}>
          {featured ? (
            <View style={styles.featured}>
              <Skeleton radius={radii.xl} style={styles.fill} />
            </View>
          ) : null}

          <View style={styles.pairRow} onLayout={onGridLayout}>
            {Array.from({ length: placeholders }, (_, i) => (
              <View
                key={i}
                style={[styles.pairCell, menuGridCellStyle(cardWidth)]}
              >
                <View style={styles.card}>
                  <View style={styles.cardImage}>
                    <Skeleton radius={0} style={styles.fill} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.nameBlock}>
                      <SkeletonText
                        lines={2}
                        lineHeight={14}
                        gap={spacing.xs}
                        lastWidth="80%"
                      />
                    </View>

                    <Skeleton width="90%" height={12} radius={radii.sm} />

                    <View style={styles.footer}>
                      <Skeleton width={56} height={16} radius={radii.sm} />
                      <Skeleton width={30} height={30} radius={radii.pill} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SkeletonGroup>
  );
}

const styles = createStyles((colors) => ({
  root: {
    width: '100%',
    alignSelf: 'stretch',
    paddingBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  grid: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  featured: {
    width: '100%',
    alignSelf: 'stretch',
    aspectRatio: 2,
    overflow: 'hidden',
    borderRadius: radii.xl,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    width: '100%',
    gap: spacing.md,
  },
  pairCell: {
    flexGrow: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  cardBody: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  nameBlock: {
    minHeight: 36,
    justifyContent: 'center',
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));