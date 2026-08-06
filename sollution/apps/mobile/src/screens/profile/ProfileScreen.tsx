import { useState, type ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, LanguageModal, Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { LOCALE_META } from '@/i18n';
import {
  getServiceStatus,
  isServiceInteractive,
  shouldRenderService,
  type ServiceId,
} from '@/modules/services';
import { colors, radii, spacing, typography } from '@/theme';

interface ProfileScreenProps {
  onSignOut?: () => void;
}

export const ProfileScreen = ({ onSignOut }: ProfileScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { profile } = useAuth();
  const [langOpen, setLangOpen] = useState(false);

  const name = profile?.name ?? t('profile.fallbackName');
  const contact = profile?.contact;
  const initial = profile?.initial ?? '?';

  const payments = getServiceStatus('paymentMethods');
  const notifications = getServiceStatus('notifications');
  const help = getServiceStatus('helpSupport');
  const paymentsOn = isServiceInteractive('paymentMethods');
  const notificationsOn = isServiceInteractive('notifications');
  const helpOn = isServiceInteractive('helpSupport');

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

        <View style={styles.group}>
          <ServiceRow
            id="paymentMethods"
            icon="💳"
            label={t('profile.paymentMethods')}
            disabled={!paymentsOn}
            hint={
              !paymentsOn && payments.reasonKey
                ? t(payments.reasonKey)
                : undefined
            }
          />
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
          {shouldRenderService('notifications') ? (
            <View
              style={[
                styles.row,
                styles.rowLast,
                !notificationsOn && styles.rowDisabled,
              ]}
            >
              <View style={styles.rowIcon}>
                <Text style={styles.rowEmoji}>🔔</Text>
              </View>
              <View style={styles.labelWrap}>
                <Text
                  style={[
                    styles.rowLabel,
                    !notificationsOn && styles.rowMuted,
                  ]}
                >
                  {t('profile.notifications')}
                </Text>
                {!notificationsOn && notifications.reasonKey ? (
                  <Text style={styles.inlineHint}>
                    {t(notifications.reasonKey)}
                  </Text>
                ) : null}
              </View>
              <Toggle
                value={false}
                onValueChange={() => undefined}
                disabled={!notificationsOn}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.group}>
          <ServiceRow
            id="helpSupport"
            label={t('profile.help')}
            disabled={!helpOn}
            hint={
              !helpOn && help.reasonKey ? t(help.reasonKey) : undefined
            }
          />
          <Pressable onPress={onSignOut} style={[styles.row, styles.rowLast]}>
            <Text style={styles.signOut}>{t('profile.signOut')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
};

function ServiceRow({
  id,
  icon,
  label,
  disabled,
  hint,
}: {
  id: ServiceId;
  icon?: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}) {
  if (!shouldRenderService(id)) return null;

  return (
    <Row
      icon={icon}
      label={label}
      hint={hint}
      disabled={disabled}
      muted={disabled}
    />
  );
}

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
});
