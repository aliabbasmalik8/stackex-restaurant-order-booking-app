import { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, FormError, Text } from '@/components/ui';
import { PasswordField } from '@/feature-ui/auth/PasswordField';
import {
  AuthError,
  authErrorMessageKey,
  changeAccountPassword,
  toAuthError,
  useSignInMethods,
} from '@/core/auth';
import { spacing, typography, createStyles, useTheme } from '@/theme';

type ChangePasswordScreenProps = {
  onBack?: () => void;
  onSaved?: () => void;
};

export function ChangePasswordScreen({
  onBack,
  onSaved,
}: ChangePasswordScreenProps) {
  useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { email, refresh } = useSignInMethods();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const match = next.length > 0 && next === confirm;
  const canSave =
    !saving &&
    current.trim().length >= 6 &&
    next.trim().length >= 6 &&
    match;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setErrorKey(null);
    if (
      ['test@stackex.ai', 'test@example.com'].includes(
        (email ?? '').trim().toLowerCase(),
      )
    ) {
      setErrorKey('auth.errors.password_reset_not_allowed');
      setSaving(false);
      return;
    }
    try {
      await changeAccountPassword({
        currentPassword: current,
        nextPassword: next,
      });
      await refresh();
      onSaved?.();
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 12 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{t('profile.changePasswordTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {t('profile.changePasswordSubtitle')}
        </Text>
        <PasswordField
          label={t('profile.currentPassword')}
          value={current}
          onChangeText={setCurrent}
          placeholder={t('auth.passwordPlaceholder')}
          textContentType="password"
          editable={!saving}
        />
        <PasswordField
          label={t('profile.newPassword')}
          value={next}
          onChangeText={setNext}
          placeholder={t('auth.passwordPlaceholder')}
          textContentType="newPassword"
          editable={!saving}
        />
        <PasswordField
          label={t('auth.confirmPassword')}
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          textContentType="newPassword"
          editable={!saving}
        />
        {confirm.length > 0 && !match ? (
          <Text style={styles.mismatch}>{t('auth.passwordMismatch')}</Text>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <FormError message={errorKey ? t(errorKey) : null} />
        <Button
          label={t('profile.savePassword')}
          onPress={() => void onSave()}
          loading={saving}
          disabled={!canSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = createStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 19,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  headerSpacer: { width: 40 },
  body: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 22,
    paddingBottom: 24,
    gap: 14,
  },
  subtitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 20,
  },
  mismatch: {
    paddingLeft: 6,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
}));
