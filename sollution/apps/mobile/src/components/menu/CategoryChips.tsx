import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radii, typography } from '@/theme';

interface CategoryChipsProps {
  categories: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}

export const CategoryChips = ({
  categories,
  activeId,
  onChange,
}: CategoryChipsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
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
          <Text style={[styles.label, active && styles.labelActive]}>
            {cat.label}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 2,
    gap: 7,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  chipActive: {
    backgroundColor: colors.chipActiveBg,
  },
  chipIdle: {
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.chipText,
  },
  labelActive: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: '#fff',
  },
});
