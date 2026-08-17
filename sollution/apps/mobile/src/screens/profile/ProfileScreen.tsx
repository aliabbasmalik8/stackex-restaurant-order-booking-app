import { useState, type ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, LanguageModal, PreviewThemeModal, PALETTE_LABEL_KEYS } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { LOCALE_META } from '@/i18n';
import { formatAddress, hasAddress, toCustomerAddress } from '@/core/profile';
import { useAddresses } from '@/api/OrderBooking/modules/addresses';
import { isPreviewMode } from '@/lib/previewMode';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

interface ProfileScreenProps {
  onEditProfile?: () => void;
  onSignInMethods?: () => void;
  onSignOut?: () => void;
}

export const ProfileScreen = ({
  onEditProfile,
  onSignInMethods,
  onSignOut,
}: ProfileScreenProps) => {
  const { paletteId } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { profile } = useAuth();
  const { data: addresses = [] } = useAddresses(Boolean(profile));
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const preview = isPreviewMode();

  const name = profile?.name ?? t('profile.fallbackName');
  const contact = profile?.contact;
  const initial = profile?.initial ?? '?';
  const defaultAddress =
    addresses.find((row) => row.isDefault) ?? addresses[0] ?? null;
  const addressLine = hasAddress(defaultAddress)
    ? formatAddress(toCustomerAddress(defaultAddress))
    : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>{t('profile.title')}</Text>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onEditProfile}
          style={styles.heroCard}
          accessibilityRole="button"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{name}</Text>
            {contact ? <Text style={styles.heroPhone}>{contact}</Text> : null}
            {addressLine ? (
              <Text style={styles.heroAddress} numberOfLines={2}>
                {addressLine}
              </Text>
            ) : null}
          </View>
          <Text style={styles.edit}>{t('common.edit')}</Text>
        </Pressable>

        <View style={styles.group}>
          <Row
            icon="🌐"
            label={t('profile.language')}
            onPress={() => setLangOpen(true)}
            last={false}
            trailing={
              <Text style={styles.linkText}>
                {t(LOCALE_META[locale].nativeKey)}
              </Text>
            }
          />
          <Row
            icon="🔑"
            label={t('profile.signInMethods')}
            onPress={onSignInMethods}
            last={!preview}
          />
          {preview ? (
            <Row
              icon="🎨"
              label={t('preview.themeChip')}
              onPress={() => setThemeOpen(true)}
              last
              trailing={
                <Text style={styles.linkText}>
                  {t(PALETTE_LABEL_KEYS[paletteId])}
                </Text>
              }
            />
          ) : null}
        </View>

        <View style={styles.group}>
          <Pressable onPress={onSignOut} style={[styles.row, styles.rowLast]}>
            <Text style={styles.signOut}>{t('profile.signOut')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <PreviewThemeModal visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </View>
  );
};

const Row = ({
  icon,
  label,
  hint,
  trailing,
  muted,
  last,
  disabled,
  onPress,
}: {
  icon?: string;
  label: string;
  hint?: string;
  trailing?: ReactNode;
  muted?: boolean;
  last?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={disabled ? undefined : onPress}
    disabled={disabled || !onPress}
    style={[styles.row, last && styles.rowLast, disabled && styles.rowDisabled]}
  >
    {icon ? (
      <View style={styles.rowIcon}>
        <Text style={styles.rowEmoji}>{icon}</Text>
      </View>
    ) : null}
    <View style={styles.labelWrap}>
      <Text style={[styles.rowLabel, muted && styles.rowMuted]}>{label}</Text>
      {hint ? <Text style={styles.inlineHint}>{hint}</Text> : null}
    </View>
    {trailing ?? <Text style={styles.chevron}>›</Text>}
  </Pressable>
);

const styles = createStyles((colors) => ({
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
  heroAddress: {
    marginTop: 4,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 16,
  },
  edit: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: 'rgba(255,255,255,0.9)',
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
  rowDisabled: { opacity: 0.55 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: { fontSize: 14 },
  labelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  rowLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  rowMuted: { color: colors.sub },
  inlineHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
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
}));
