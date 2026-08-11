import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import {
  isAppleAuthInteractive,
  shouldRenderAppleAuth,
} from '@/features/auth';
import { colors } from '@/theme';
import type { StyleProp, ViewStyle } from 'react-native';

type AppleAuthButtonProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppleAuthButton({ onPress, style }: AppleAuthButtonProps) {
  const { t } = useTranslation();
  if (!shouldRenderAppleAuth()) return null;

  return (
    <Button
      variant="social"
      label={t('auth.apple')}
      onPress={onPress}
      disabled={!isAppleAuthInteractive()}
      style={style}
      leftSlot={
        <Ionicons name="logo-apple" size={18} color={colors.onHero} />
      }
    />
  );
}
