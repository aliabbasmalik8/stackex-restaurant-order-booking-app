import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, FormError } from '@/components/ui';
import {
  AuthError,
  authErrorMessageKey,
  toAuthError,
} from '@/core/auth';
import {
  isGoogleAuthInteractive,
  shouldRenderGoogleAuth,
} from '@/features/auth';
import { useTheme } from '@/theme';
import type { StyleProp, ViewStyle } from 'react-native';

type GoogleAuthButtonProps = {
  onPress?: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
};

export function GoogleAuthButton({ onPress, style }: GoogleAuthButtonProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  if (!shouldRenderGoogleAuth()) return null;

  const interactive = isGoogleAuthInteractive();

  const handlePress = async () => {
    if (!interactive || loading) return;
    setLoading(true);
    setErrorKey(null);
    try {
      await onPress?.();
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <Button
        variant="social"
        label={t('auth.google')}
        onPress={() => {
          void handlePress();
        }}
        disabled={!interactive || loading}
        loading={loading}
        style={styles.button}
        leftSlot={
          <Ionicons name="logo-google" size={16} color={colors.onHero} />
        }
      />
      {errorKey ? (
        <FormError message={t(errorKey)} tone="onHero" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 8,
  },
  button: {
    alignSelf: 'stretch',
  },
});
