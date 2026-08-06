import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, PhoneField, Text } from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
} from '@/modules/services';
import { colors, spacing, typography } from '@/theme';

type PhoneLoginFormProps = {
  onSendCode?: (phone: string) => void;
};

/**
 * Phone OTP sign-in block. Kept modular — gated by `phoneLogin` service
 * (hidden in preview until OTP is affordable / wired).
 */
export function PhoneLoginForm({ onSendCode }: PhoneLoginFormProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const status = getServiceStatus('phoneLogin');
  const interactive = isServiceInteractive('phoneLogin');

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
