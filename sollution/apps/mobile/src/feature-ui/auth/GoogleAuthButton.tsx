import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import {
  isGoogleAuthInteractive,
  shouldRenderGoogleAuth,
} from '@/features/auth';
import { colors } from '@/theme';
import type { StyleProp, ViewStyle } from 'react-native';

type GoogleAuthButtonProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function GoogleAuthButton({ onPress, style }: GoogleAuthButtonProps) {
  const { t } = useTranslation();
  if (!shouldRenderGoogleAuth()) return null;

  return (
    <Button
      variant="social"
      label={t('auth.google')}
      onPress={onPress}
      disabled={!isGoogleAuthInteractive()}
      style={style}
      leftSlot={
        <Ionicons name="logo-google" size={16} color={colors.onHero} />
      }
    />
  );
}
