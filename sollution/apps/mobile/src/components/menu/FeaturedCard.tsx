import { useEffect, useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '@/core/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import { FEATURED_MAX_WIDTH } from '@/components/menu/useMenuGrid';
import { money } from '@/utils/money';

interface FeaturedCardProps {
  item: MenuItem;
  onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: FeaturedCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [item.image]);
  const name = localized(locale, item.name, item.name_arabic);
  const subtitle = localized(
    locale,
    item.featuredSubtitle ?? item.description,
    item.featuredSubtitle_arabic ?? item.description_arabic,
  );
  const showImage = Boolean(item.image) && !imageFailed;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {showImage ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons name="image-outline" size={36} color={colors.muted} />
        </View>
      )}
      <View style={styles.scrim} />
      <View style={styles.badge}>
        <Text style={styles.badgeText} numberOfLines={1}>
          {t('menu.comboBadge')}
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.price}>{money(item.price)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  card: {
    width: '100%',
    maxWidth: FEATURED_MAX_WIDTH,
    alignSelf: 'center',
    aspectRatio: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '36%',
    backgroundColor: colors.hero,
    opacity: 0.42,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    maxWidth: '72%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: { flex: 1, minWidth: 0, gap: spacing.xs },
  name: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHero,
  },
  sub: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHeroSoft,
  },
  pricePill: {
    flexShrink: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  price: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
}));
