import { useEffect, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';
import {
  AuthError,
  authErrorMessageKey,
  lookupEmailAuthStatus,
  sendPasswordReset,
  toAuthError,
} from '@/core/auth';
import {
  getPasswordAuthStatus,
  isPasswordAuthInteractive,
} from '@/features/auth';
import { radii, spacing, typography, createStyles, useTheme } from '@/theme';

export type PasswordLoginValues = {
  email: string;
  password: string;
};

type PasswordLoginFormProps = {
  onSubmit?: (values: PasswordLoginValues) => void | Promise<void>;
};

const FIELD_HEIGHT = 58;
const FIELD_GAP = 10;
const BANNER_HEIGHT = 36;
const BANNER_GAP = 10;
const fadeTiming = { duration: 180, easing: Easing.out(Easing.cubic) };
const heightTiming = { duration: 220, easing: Easing.out(Easing.cubic) };

/**
 * Email first → Nest email-status → password, error, or Firebase reset mail.
 * Gated by `passwordAuth` feature.
 */
export function PasswordLoginForm({ onSubmit }: PasswordLoginFormProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const status = getPasswordAuthStatus();
  const interactive = isPasswordAuthInteractive();
  const emailValid = email.trim().includes('@');
  const showBanner = Boolean(errorKey || resetSent);
  const bannerTone = errorKey ? 'error' : 'info';

  const passwordOpen = useSharedValue(0);
  const bannerOpen = useSharedValue(0);

  useEffect(() => {
    passwordOpen.value = withTiming(showPasswordField ? 1 : 0, heightTiming);
  }, [passwordOpen, showPasswordField]);

  useEffect(() => {
    bannerOpen.value = withTiming(showBanner ? 1 : 0, fadeTiming);
  }, [bannerOpen, showBanner]);

  const passwordSlotStyle = useAnimatedStyle(() => ({
    height: passwordOpen.value * (FIELD_HEIGHT + FIELD_GAP),
    opacity: passwordOpen.value,
    overflow: 'hidden' as const,
  }));

  const bannerSlotStyle = useAnimatedStyle(() => ({
    height: bannerOpen.value * (BANNER_HEIGHT + BANNER_GAP),
    opacity: bannerOpen.value,
    overflow: 'hidden' as const,
  }));

  const canContinue = interactive && !loading && emailValid && !showPasswordField;
  const canSignIn =
    interactive &&
    !loading &&
    showPasswordField &&
    emailValid &&
    password.trim().length >= 6;

  const dismissBanner = () => {
    setErrorKey(null);
    setResetSent(false);
  };

  const resetLookup = () => {
    setShowPasswordField(false);
    setResetSent(false);
    setPassword('');
    setErrorKey(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (showPasswordField || resetSent || errorKey) {
      resetLookup();
    }
  };

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    setErrorKey(null);
    try {
      const emailStatus = await lookupEmailAuthStatus(email);
      if (emailStatus === 'ok') {
        setResetSent(false);
        setShowPasswordField(true);
        return;
      }
      if (emailStatus === 'account-not-exist') {
        setResetSent(false);
        setErrorKey('auth.errors.account_not_exist');
        return;
      }
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSignIn) return;
    setLoading(true);
    setErrorKey(null);
    try {
      await onSubmit?.({ email: email.trim(), password });
    } catch (error) {
      const authErr =
        error instanceof AuthError ? error : toAuthError(error);
      setErrorKey(authErrorMessageKey(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  const bannerMessage = errorKey
    ? t(errorKey)
    : t('auth.passwordResetSent');

  return (
    <View style={styles.form}>
      <Animated.View
        style={bannerSlotStyle}
        pointerEvents={showBanner ? 'auto' : 'none'}
      >
        <View
          style={[
            styles.banner,
            bannerTone === 'error' ? styles.bannerError : styles.bannerInfo,
          ]}
        >
          <View
            style={[
              styles.bannerBar,
              bannerTone === 'error' ? styles.barError : styles.barInfo,
            ]}
          />
          <Text style={styles.bannerText} numberOfLines={2}>
            {bannerMessage}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={dismissBanner}
            hitSlop={8}
            style={styles.bannerClose}
          >
            <Ionicons name="close" size={14} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
      </Animated.View>

      <View style={styles.field}>
        <Ionicons
          name="mail-outline"
          size={18}
          color={colors.muted}
          style={styles.fieldIcon}
        />
        <TextInput
          value={email}
          onChangeText={handleEmailChange}
          placeholder={t('auth.emailPlaceholder')}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType={showPasswordField ? 'next' : 'done'}
          onSubmitEditing={() => {
            if (showPasswordField) return;
            void handleContinue();
          }}
          editable={interactive && !loading}
          style={styles.input}
        />
      </View>

      <Animated.View
        style={passwordSlotStyle}
        pointerEvents={showPasswordField ? 'auto' : 'none'}
      >
        <View style={[styles.field, styles.passwordField]}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.muted}
            style={styles.fieldIcon}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
            editable={interactive && !loading && showPasswordField}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? t('auth.hidePassword') : t('auth.showPassword')
            }
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eye}
            disabled={!interactive || loading}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        </View>
      </Animated.View>

      {showPasswordField ? (
        <Button
          label={t('auth.signIn')}
          onPress={() => void handleSubmit()}
          disabled={!canSignIn}
          loading={loading}
          style={styles.cta}
        />
      ) : (
        <Button
          label={resetSent ? t('auth.resendEmail') : t('auth.continue')}
          onPress={() => void handleContinue()}
          disabled={!canContinue}
          loading={loading}
          style={styles.cta}
        />
      )}

      {status.reasonKey ? (
        <Text style={styles.hint}>{t(status.reasonKey)}</Text>
      ) : null}
    </View>
  );
}

const styles = createStyles((colors) => ({
  form: {
    marginTop: spacing.xxl,
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: BANNER_GAP,
  },
  bannerError: {
    backgroundColor: 'rgba(255, 82, 82, 0.22)',
  },
  bannerInfo: {
    backgroundColor: 'rgba(46, 204, 138, 0.22)',
  },
  bannerBar: {
    width: 3,
    alignSelf: 'stretch',
  },
  barError: {
    backgroundColor: '#ff8a80',
  },
  barInfo: {
    backgroundColor: '#5ee0b5',
  },
  bannerText: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHero,
    lineHeight: 14,
  },
  bannerClose: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    height: FIELD_HEIGHT,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 8,
  },
  passwordField: {
    marginTop: FIELD_GAP,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    paddingVertical: 0,
  },
  eye: {
    padding: 4,
    marginLeft: 4,
  },
  cta: {
    marginTop: 16,
  },
  hint: {
    marginTop: 10,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.onHeroMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
}));
