import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
} from '@/modules/services';
import { colors, radii, spacing, typography } from '@/theme';

export type PasswordLoginValues = {
  email: string;
  password: string;
};

type PasswordLoginFormProps = {
  onSubmit?: (values: PasswordLoginValues) => void;
};

/**
 * Email + password sign-in (preview default).
 * Gated by `passwordLogin` service.
 */
export function PasswordLoginForm({ onSubmit }: PasswordLoginFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const status = getServiceStatus('passwordLogin');
  const interactive = isServiceInteractive('passwordLogin');

  const canSubmit =
    interactive &&
    email.trim().includes('@') &&
    password.trim().length >= 6;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ email: email.trim(), password });
  };

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          editable={interactive}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          placeholderTextColor={colors.muted}
          secureTextEntry={!showPassword}
          textContentType="password"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={interactive}
          style={[styles.input, styles.inputWithIcon]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            showPassword ? t('auth.hidePassword') : t('auth.showPassword')
          }
          onPress={() => setShowPassword((v) => !v)}
          style={styles.eye}
          disabled={!interactive}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.muted}
          />
        </Pressable>
      </View>

      <Button
        label={t('auth.signIn')}
        onPress={handleSubmit}
        disabled={!canSubmit}
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
  field: {
    height: 58,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingRight: 8,
  },
  eye: {
    padding: 4,
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
