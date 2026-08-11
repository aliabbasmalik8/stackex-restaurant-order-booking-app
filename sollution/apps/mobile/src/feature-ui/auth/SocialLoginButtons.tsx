import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OrDivider, Text } from '@/components/ui';
import {
  getAppleAuthStatus,
  getGoogleAuthStatus,
  isAppleAuthInteractive,
  isGoogleAuthInteractive,
  shouldRenderAppleAuth,
  shouldRenderGoogleAuth,
} from '@/features/auth';
import { AppleAuthButton } from './AppleAuthButton';
import { GoogleAuthButton } from './GoogleAuthButton';
import { colors, typography } from '@/theme';

type SocialLoginButtonsProps = {
  onApple?: () => void;
  onGoogle?: () => void;
};

/** Composes apple + google auth buttons for sign-in. */
export function SocialLoginButtons({
  onApple,
  onGoogle,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const apple = getAppleAuthStatus();
  const google = getGoogleAuthStatus();
  const show = shouldRenderAppleAuth() || shouldRenderGoogleAuth();

  if (!show) return null;

  const reasonKey =
    (!isAppleAuthInteractive() && apple.reasonKey) ||
    (!isGoogleAuthInteractive() && google.reasonKey) ||
    undefined;

  return (
    <View style={styles.block}>
      <OrDivider label={t('auth.orContinueWith')} />
      <View style={styles.row}>
        <AppleAuthButton onPress={onApple} style={styles.btn} />
        <GoogleAuthButton onPress={onGoogle} style={styles.btn} />
      </View>
      {reasonKey ? <Text style={styles.hint}>{t(reasonKey)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 26,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: { flex: 1 },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
