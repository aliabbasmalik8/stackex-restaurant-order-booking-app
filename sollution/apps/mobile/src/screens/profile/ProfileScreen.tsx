import { useState, type ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, LanguageModal, Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { LOCALE_META } from '@/i18n';
import { PROFILE_USER } from '@/data/demo';
import { colors, radii, spacing, typography } from '@/theme';

interface ProfileScreenProps {
  onSignOut?: () => void;
}

export const ProfileScreen = ({ onSignOut }: ProfileScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  const name = profile?.name ?? t('profile.fallbackName');
  const contact = profile?.contact;
  const initial = profile?.initial ?? '?';
  // Preview loyalty until a real rewards API exists.
  const loyaltyStamps = PROFILE_USER.loyaltyStamps;
  const loyaltyGoal = PROFILE_USER.loyaltyGoal;
  const remaining = loyaltyGoal - loyaltyStamps;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{t('profile.title')}</Text>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{name}</Text>
            {contact ? <Text style={styles.heroPhone}>{contact}</Text> : null}
          </View>
          <Text style={styles.edit}>{t('common.edit')}</Text>
        </View>

        <View style={styles.loyalty}>
          <View style={styles.loyaltyIcon}>
            <Text style={styles.star}>★</Text>
          </View>
          <View style={styles.loyaltyCopy}>
            <Text style={styles.loyaltyTitle}>
              {t('profile.loyaltyTitle', {
                current: loyaltyStamps,
                goal: loyaltyGoal,
              })}
            </Text>
            <Text style={styles.loyaltySub}>
              {t('profile.loyaltySub', { remaining })}
            </Text>
          </View>
          <Text style={styles.loyaltyCount}>
            {loyaltyStamps}/{loyaltyGoal}
          </Text>
        </View>

        <View style={styles.group}>
          <Row icon="💳" label={t('profile.paymentMethods')} />
          <Row
            icon="🌐"
            label={t('profile.language')}
            onPress={() => setLangOpen(true)}
            trailing={
              <Text style={styles.linkText}>
                {t(LOCALE_META[locale].nativeKey)}
              </Text>
            }
          />
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowEmoji}>🔔</Text>
            </View>
            <Text style={styles.rowLabel}>{t('profile.notifications')}</Text>
            <Toggle value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <View style={styles.group}>
          <Row label={t('profile.help')} muted />
          <Pressable onPress={onSignOut} style={[styles.row, styles.rowLast]}>
            <Text style={styles.signOut}>{t('profile.signOut')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
};

const Row = ({
  icon,
  label,
  trailing,
  muted,
  last,
  onPress,
}: {
  icon?: string;
  label: string;
  trailing?: ReactNode;
  muted?: boolean;
  last?: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.row, last && styles.rowLast]}
  >
    {icon ? (
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>{icon}</Text>
      </View>
    ) : null}
    <Text style={[styles.rowLabel, muted && styles.rowMuted]}>{label}</Text>
    {trailing ?? <Text style={styles.chevron}>›</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
    paddingHorizontal: spacing.screenX,
  },
  body: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.hero,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
  },
  heroCopy: { flex: 1, gap: 1 },
  heroName: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.onHero,
  },
  heroPhone: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  edit: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.9)',
  },
  loyalty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 17,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  loyaltyIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 16,
    color: colors.badgeText,
  },
  loyaltyCopy: { flex: 1, gap: 1 },
  loyaltyTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  loyaltySub: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  loyaltyCount: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.price,
  },
  group: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: { fontSize: 14 },
  rowLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  rowMuted: { color: colors.sub },
  chevron: {
    fontSize: 18,
    color: colors.muted,
  },
  linkText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  signOut: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.link,
  },
});
