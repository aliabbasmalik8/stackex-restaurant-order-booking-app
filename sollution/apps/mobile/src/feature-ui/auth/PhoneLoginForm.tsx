import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, PhoneField, Text } from '@/components/ui';
import {
  getPhoneAuthStatus,
  isPhoneAuthInteractive,
} from '@/features/auth';
import { colors, spacing, typography } from '@/theme';

type PhoneLoginFormProps = {
  onSendCode?: (phone: string) => void;
};

/**
 * Phone OTP sign-in block. Gated by `phoneAuth` (disabled until OTP is wired).
 */
export function PhoneLoginForm({ onSendCode }: PhoneLoginFormProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const status = getPhoneAuthStatus();
  const interactive = isPhoneAuthInteractive();

  const handleSendCode = () => {
    if (!interactive) return;
    onSendCode?.(phone.trim());
  };

  return (
    <View style={styles.form}>
      <PhoneField
        value={phone}
        onChangeText={setPhone}
        placeholder={t('auth.phonePlaceholder')}
        returnKeyType="done"
        onSubmitEditing={handleSendCode}
        editable={interactive}
      />
      <Button
        label={t('auth.sendCode')}
        onPress={handleSendCode}
        disabled={!interactive || phone.trim().length < 7}
      />
      {status.reasonKey ? (
        <Text style={styles.hint}>{t(status.reasonKey)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
