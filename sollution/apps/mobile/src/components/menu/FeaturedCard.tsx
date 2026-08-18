import { useEffect, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '@/core/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';
import { money } from '@/utils/money';

interface FeaturedCardProps {
  item: MenuItem;
  onPress?: () => void;
}

function overlayFor(width: number) {
  if (width < 480) {
    return {
      nameSize: typography.fontSize.xl,
      subSize: typography.fontSize.sm,
      priceSize: typography.fontSize.md,
      badgeSize: typography.fontSize.xs,
      iconSize: 36,
      padX: spacing.lg,
      padBottom: spacing.md,
      pillPadY: spacing.sm,
      pillPadX: spacing.md,
      badgePadY: spacing.sm,
      badgePadX: spacing.md,
    };
  }
  if (width < 900) {
    return {
      nameSize: 22,
      subSize: 14,
      priceSize: 16,
      badgeSize: 12,
      iconSize: 44,
      padX: spacing.xl,
      padBottom: spacing.lg,
      pillPadY: 10,
      pillPadX: spacing.lg,
      badgePadY: 10,
      badgePadX: spacing.lg,
    };
  }
  return {
    nameSize: 28,
    subSize: 16,
    priceSize: 18,
    badgeSize: 13,
    iconSize: 52,
    padX: spacing.xxl,
    padBottom: spacing.xl,
    pillPadY: spacing.md,
    pillPadX: spacing.xl,
    badgePadY: spacing.md,
    badgePadX: spacing.lg,
  };
}

export const FeaturedCard = ({ item, onPress }: FeaturedCardProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(
    Math.max(0, windowWidth - spacing.screenX * 2),
  );
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
  const overlay = overlayFor(cardWidth);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0 && Math.abs(next - cardWidth) > 0.5) {
          setCardWidth(next);
        }
      }}
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
          <Ionicons
            name="image-outline"
            size={overlay.iconSize}
            color={colors.muted}
          />
        </View>
      )}
      <View style={styles.scrim} />
      <View
        style={[
          styles.badge,
          {
            paddingVertical: overlay.badgePadY,
            paddingHorizontal: overlay.badgePadX,
          },
        ]}
      >
        <Text
          style={[styles.badgeText, { fontSize: overlay.badgeSize }]}
          numberOfLines={1}
        >
          {t('menu.comboBadge')}
        </Text>
      </View>
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: overlay.padX,
            paddingBottom: overlay.padBottom,
          },
        ]}
      >
        <View style={styles.copy}>
          <Text
            style={[styles.name, { fontSize: overlay.nameSize }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={[styles.sub, { fontSize: overlay.subSize }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
        <View
          style={[
            styles.pricePill,
            {
              paddingVertical: overlay.pillPadY,
              paddingHorizontal: overlay.pillPadX,
            },
          ]}
        >
          <Text style={[styles.price, { fontSize: overlay.priceSize }]}>
            {money(item.price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = createStyles((colors) => ({
  card: {
    width: '100%',
    alignSelf: 'stretch',
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
