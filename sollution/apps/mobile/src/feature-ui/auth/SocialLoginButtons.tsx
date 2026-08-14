import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FormError, OrDivider } from '@/components/ui';
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

/** Composes google + apple auth buttons for sign-in. */
export function SocialLoginButtons({
  onApple,
  onGoogle,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const [expoGoNote, setExpoGoNote] = useState(false);
  const show = shouldRenderAppleAuth() || shouldRenderGoogleAuth();

  if (!show) return null;

  return (
    <View style={styles.block}>
      <OrDivider label={t('auth.orContinueWith')} />
      <View style={styles.row}>
        <GoogleAuthButton
          onPress={onGoogle}
          onExpoGo={() => setExpoGoNote(true)}
          style={styles.btn}
        />
        <AppleAuthButton onPress={onApple} style={styles.btn} />
      </View>
      {expoGoNote ? (
        <FormError message={t('auth.errors.expo_go')} tone="onHero" />
      ) : null}
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
