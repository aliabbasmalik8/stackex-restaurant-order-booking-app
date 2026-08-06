import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import type { MenuItem } from '@/modules/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { colors, radii, typography } from '@/theme';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: () => void;
  onAdd?: () => void;
}

export const MenuItemCard = ({ item, onPress, onAdd }: MenuItemCardProps) => {
  const { locale } = useLanguage();
  const name = localized(locale, item.name, item.name_arabic);
  const description = localized(
    locale,
    item.description,
    item.description_arabic,
  );
  const badge = localized(locale, item.badge ?? '', item.badge_arabic);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.badge && item.badge !== 'combo' ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${name}`}
          onPress={onAdd}
          style={styles.add}
        >
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.desc} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.price}>AED {item.price}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrap: {
    height: 108,
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 9,
    top: 9,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  add: {
    position: 'absolute',
    right: 9,
    bottom: -13,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  addText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 20,
  },
  body: {
    paddingTop: 14,
    paddingHorizontal: 13,
    paddingBottom: 13,
    gap: 3,
  },
  name: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    lineHeight: 17,
  },
  desc: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  price: {
    marginTop: 2,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.price,
  },
});
