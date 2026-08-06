import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, OrDivider, Text } from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
  shouldRenderService,
} from '@/modules/services';
import { colors, typography } from '@/theme';

type SocialLoginButtonsProps = {
  onApple?: () => void;
  onGoogle?: () => void;
};

/** Apple / Google row — gated per service (`disabled` in preview). */
export function SocialLoginButtons({
  onApple,
  onGoogle,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const apple = getServiceStatus('appleLogin');
  const google = getServiceStatus('googleLogin');
  const show =
    shouldRenderService('appleLogin') || shouldRenderService('googleLogin');

  if (!show) return null;

  const reasonKey =
    (!isServiceInteractive('appleLogin') && apple.reasonKey) ||
    (!isServiceInteractive('googleLogin') && google.reasonKey) ||
    undefined;

  return (
    <View style={styles.block}>
      <OrDivider label={t('auth.orContinueWith')} />
      <View style={styles.row}>
        {shouldRenderService('appleLogin') ? (
          <Button
            variant="social"
            label={t('auth.apple')}
            onPress={onApple}
            disabled={!isServiceInteractive('appleLogin')}
            style={styles.btn}
            leftSlot={
              <Ionicons name="logo-apple" size={18} color={colors.onHero} />
            }
          />
        ) : null}
        {shouldRenderService('googleLogin') ? (
          <Button
            variant="social"
            label={t('auth.google')}
            onPress={onGoogle}
            disabled={!isServiceInteractive('googleLogin')}
            style={styles.btn}
            leftSlot={
              <Ionicons name="logo-google" size={16} color={colors.onHero} />
            }
          />
        ) : null}
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
