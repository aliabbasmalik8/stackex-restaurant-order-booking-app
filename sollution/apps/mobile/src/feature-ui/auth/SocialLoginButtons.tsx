import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OrDivider } from '@/components/ui';
import {
  shouldRenderAppleAuth,
  shouldRenderGoogleAuth,
} from '@/features/auth';
import { AppleAuthButton } from './AppleAuthButton';
import { GoogleAuthButton } from './GoogleAuthButton';

type SocialLoginButtonsProps = {
  onApple?: () => void | Promise<void>;
  onGoogle?: () => void | Promise<void>;
};

/** Composes google + apple auth buttons for sign-in. Disabled state is enough — no hint copy. */
export function SocialLoginButtons({
  onApple,
  onGoogle,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const show = shouldRenderAppleAuth() || shouldRenderGoogleAuth();

  if (!show) return null;

  return (
    <View style={styles.block}>
      <OrDivider label={t('auth.orContinueWith')} />
      <View style={styles.row}>
        <GoogleAuthButton onPress={onGoogle} style={styles.btn} />
        <AppleAuthButton onPress={onApple} style={styles.btn} />
      </View>
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
});
