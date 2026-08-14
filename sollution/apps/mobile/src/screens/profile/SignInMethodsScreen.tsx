import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, FormError, Text } from '@/components/ui';
import { SignInMethodRow } from '@/feature-ui/auth/SignInMethodRow';
import {
  AuthError,
  authErrorMessageKey,
  toAuthError,
  useConnectGoogle,
  useSignInMethods,
} from '@/core/auth';
import { useAuth } from '@/context/AuthContext';
import {
  isGoogleAuthInteractive,
  shouldRenderGoogleAuth,
} from '@/features/auth';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

type SignInMethodsScreenProps = {
  onBack?: () => void;
  onAddPassword?: () => void;
  onChangePassword?: () => void;
};

export function SignInMethodsScreen({
  onBack,
  onAddPassword,
  onChangePassword,
}: SignInMethodsScreenProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const methods = useSignInMethods();
  const { connectGoogle, loading: connecting } = useConnectGoogle();
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const email = methods.email ?? profile?.email ?? null;
  const showGoogle = shouldRenderGoogleAuth() || methods.isGoogleConnected;
  const googleInteractive = isGoogleAuthInteractive();
  const canManage = methods.hasFirebaseSession;

  const onConnectGoogle = async () => {
    if (!canManage || connecting || methods.isGoogleConnected) return;
    setErrorKey(null);
    try {
      await connectGoogle();
      await methods.refresh();
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('profile.signInMethods')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {t('profile.signInMethodsSubtitle')}
        </Text>

        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>{t('profile.emailReadOnly')}</Text>
          <Text style={styles.emailValue}>
            {email ?? t('profile.emailMissing')}
          </Text>
        </View>

        <View style={styles.group}>
          <SignInMethodRow
            label={t('auth.password')}
            hint={
              methods.hasPassword
                ? t('profile.passwordSetHint')
                : t('profile.passwordAddHint')
            }
            actionLabel={
              methods.hasPassword
                ? t('profile.changePassword')
                : t('profile.addPassword')
            }
            onPress={
              methods.hasPassword ? onChangePassword : onAddPassword
            }
            disabled={!canManage}
            last={!showGoogle}
          />
          {showGoogle ? (
            <SignInMethodRow
              label={t('auth.google')}
              hint={
                methods.isGoogleConnected
                  ? t('profile.googleConnectedHint')
                  : t('profile.googleConnectHint')
              }
              actionLabel={
                connecting
                  ? t('common.loading')
                  : methods.isGoogleConnected
                    ? t('profile.googleConnected')
                    : t('profile.connectGoogle')
              }
              onPress={
                methods.isGoogleConnected ? undefined : () => void onConnectGoogle()
              }
              disabled={
                !canManage ||
                connecting ||
                methods.isGoogleConnected ||
                !googleInteractive
              }
              last
            />
          ) : null}
        </View>

        {!canManage && methods.ready ? (
          <Text style={styles.sessionHint}>
            {t('profile.noFirebaseSession')}
          </Text>
        ) : null}

        <FormError message={errorKey ? t(errorKey) : null} />
      </ScrollView>
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  headerSpacer: { width: 40 },
  body: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 14,
  },
  subtitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 20,
  },
  emailCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 17,
    gap: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  emailLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  emailValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
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
  sessionHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    lineHeight: 18,
  },
}));
