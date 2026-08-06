import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Field, Text } from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
} from '@/modules/services';
import { colors, radii, typography } from '@/theme';

export type CreateAccountPasswordValues = {
  name: string;
  email: string;
  password: string;
  whatsappOffers: boolean;
};

type CreateAccountPasswordFormProps = {
  onSubmit?: (values: CreateAccountPasswordValues) => void;
};

/**
 * Email + password create-account (preview default).
 * Gated by `createAccountPassword`.
 */
export function CreateAccountPasswordForm({
  onSubmit,
}: CreateAccountPasswordFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappOffers, setWhatsappOffers] = useState(true);
  const status = getServiceStatus('createAccountPassword');
  const interactive = isServiceInteractive('createAccountPassword');

  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit =
    interactive &&
    name.trim().length > 1 &&
    email.trim().includes('@') &&
    password.trim().length >= 6 &&
    passwordsMatch;

  return (
    <View style={styles.wrap}>
      <View style={styles.form}>
        <Field
          label={t('auth.fullName')}
          value={name}
          onChangeText={setName}
          placeholder={t('auth.namePlaceholder')}
          autoCapitalize="words"
          editable={interactive}
        />
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          editable={interactive}
        />

        <View style={styles.passwordBlock}>
          <Text style={styles.passwordLabel}>{t('auth.password')}</Text>
          <View style={styles.passwordField}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              editable={interactive}
              style={styles.passwordInput}
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
        </View>

        <View style={styles.passwordBlock}>
          <Text style={styles.passwordLabel}>{t('auth.confirmPassword')}</Text>
          <View style={styles.passwordField}>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              editable={interactive}
              style={styles.passwordInput}
            />
          </View>
          {confirm.length > 0 && !passwordsMatch ? (
            <Text style={styles.mismatch}>{t('auth.passwordMismatch')}</Text>
          ) : null}
        </View>

        <Checkbox
          checked={whatsappOffers}
          onChange={setWhatsappOffers}
          label={t('auth.whatsappOffers')}
        />
      </View>

      <Button
        label={t('auth.createAccountCta')}
        disabled={!canSubmit}
        onPress={() =>
          onSubmit?.({
            name: name.trim(),
            email: email.trim(),
            password,
            whatsappOffers,
          })
        }
      />

      {status.reasonKey ? (
        <Text style={styles.hint}>{t(status.reasonKey)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  form: { gap: 12 },
  passwordBlock: { gap: 6 },
  passwordLabel: {
    paddingLeft: 6,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  passwordField: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    paddingVertical: 0,
  },
  eye: { padding: 4 },
  mismatch: {
    paddingLeft: 6,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
