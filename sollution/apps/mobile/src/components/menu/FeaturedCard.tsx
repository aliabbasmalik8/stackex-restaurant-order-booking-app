import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '@/modules/catalog';
import { localized } from '@/utils/localized';
import { useLanguage } from '@/i18n/LanguageContext';
import { colors, radii, typography } from '@/theme';

interface FeaturedCardProps {
  item: MenuItem;
  onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: FeaturedCardProps) => {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const name = localized(locale, item.name, item.name_arabic);
  const subtitle = localized(
    locale,
    item.featuredSubtitle ?? item.description,
    item.featuredSubtitle_arabic ?? item.description_arabic,
  );

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.scrim} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t('menu.comboBadge')}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.price}>AED {item.price}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 165,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
    backgroundColor: 'rgba(20,10,8,0.72)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.badgeBg,
    transform: [{ rotate: '-2deg' }],
  },
  badgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.badgeText,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: { flex: 1, gap: 2 },
  name: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 17,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
  },
  sub: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
  },
  pricePill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  price: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onPrimary,
  },
});
