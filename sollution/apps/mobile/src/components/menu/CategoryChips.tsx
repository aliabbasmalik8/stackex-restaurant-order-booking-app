import { ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface CategoryChipsProps {
  categories: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

export const CategoryChips = ({
  categories,
  activeId,
  onChange,
}: CategoryChipsProps) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}
    >
      {categories.map((cat) => {
        const active = cat.id === activeId;

        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, active && styles.labelActive]}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = createStyles((colors) => ({
  scroller: {
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.chipActiveBg,
    borderColor: colors.chipActiveBg,
  },
  chipIdle: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.chipText,
  },
  labelActive: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.selText,
  },
}));