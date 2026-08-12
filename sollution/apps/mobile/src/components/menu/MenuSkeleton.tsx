import { View } from 'react-native';
import { Skeleton, SkeletonGroup, SkeletonText } from '@/components/ui/Skeleton';
import { radii, spacing, createStyles, useTheme } from '@/theme';

type MenuSkeletonProps = {
  /** How many grid card placeholders (even looks best). Default 4. */
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
  itemCount = 4,
  featured = true,
  chipCount = 5,
}: MenuSkeletonProps) {
  useTheme();
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
            <Skeleton height={165} radius={22} style={styles.featured} />
          ) : null}

          <View style={styles.pairRow}>
            {Array.from({ length: itemCount }, (_, i) => (
              <View key={i} style={styles.pairCell}>
                <View style={styles.card}>
                  <Skeleton height={108} radius={0} style={styles.cardImage} />
                  <View style={styles.cardBody}>
                    <SkeletonText lines={2} lineHeight={11} lastWidth="70%" />
                    <Skeleton width={64} height={14} radius={radii.sm} />
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
    paddingBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    paddingTop: 14,
    paddingBottom: 2,
    gap: 7,
  },
  grid: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 14,
    gap: 14,
  },
  featured: {
    width: '100%',
  },
  pairRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pairCell: {
    width: '48%',
    maxWidth: '48%',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
}));
