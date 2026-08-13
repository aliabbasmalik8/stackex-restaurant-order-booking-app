import { useEffect, useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import type { MenuItem } from '@/core/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import { money } from '@/utils/money';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: () => void;
  onAdd?: () => void;
  /** When true, hide the quick-add control (browsing only). */
  orderingDisabled?: boolean;
}

export const MenuItemCard = ({
  item,
  onPress,
  onAdd,
  orderingDisabled = false,
}: MenuItemCardProps) => {
  const { colors } = useTheme();
  const { locale } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [item.image]);

  const name = localized(locale, item.name, item.name_arabic);
  const description = localized(
    locale,
    item.description,
    item.description_arabic,
  );
  const badge = localized(locale, item.badge ?? '', item.badge_arabic);
  const showImage = Boolean(item.image) && !imageFailed;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {showImage ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={28} color={colors.muted} />
          </View>
        )}

        {item.badge && item.badge !== 'combo' ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {badge}
            </Text>
          </View>
        ) : null}

        {!orderingDisabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${name}`}
            onPress={onAdd}
            hitSlop={6}
            style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.desc} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.price}>{money(item.price)}</Text>
      </View>
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    maxWidth: '70%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  add: {
    position: 'absolute',
    right: spacing.sm,
    bottom: -12,
    width: 30,
    height: 30,
    borderRadius: radii.pill,
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
  addPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  addText: {
    color: colors.onPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 20,
    includeFontPadding: false,
  },
  body: {
    flexGrow: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  desc: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    lineHeight: 15,
  },
  price: {
    marginTop: 'auto',
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.price,
  },
}));