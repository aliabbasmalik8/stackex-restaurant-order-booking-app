import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  BrandMark,
  Button,
  OrDivider,
  PhoneField,
  Text,
} from '@/components/ui';
import { AUTH_COPY } from '@/constants';
import { brand, colors, spacing, typography } from '@/theme';

interface SignInScreenProps {
  onSendCode?: (phone: string) => void;
  onApple?: () => void;
  onGoogle?: () => void;
  onCreateAccount?: () => void;
  onContinueAsGuest?: () => void;
}

export const SignInScreen = ({
  onSendCode,
  onApple,
  onGoogle,
  onCreateAccount,
  onContinueAsGuest,
}: SignInScreenProps) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');

  const handleSendCode = () => {
    onSendCode?.(phone.trim());
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 20) }]}>
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Text style={styles.watermark}>{brand.monogram}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandMark />
            <View style={styles.headerCopy}>
              <Text variant="display" color={colors.onHero}>
                {AUTH_COPY.welcomeBack}
              </Text>
              <Text variant="subtitle" color={colors.onHeroSoft}>
                {AUTH_COPY.signInSubtitle}
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <PhoneField
              value={phone}
              onChangeText={setPhone}
              placeholder={AUTH_COPY.phonePlaceholder}
              returnKeyType="done"
              onSubmitEditing={handleSendCode}
            />
            <Button
              label={AUTH_COPY.sendCode}
              onPress={handleSendCode}
              disabled={phone.trim().length < 7}
            />
          </View>

          <View style={styles.socialBlock}>
            <OrDivider label={AUTH_COPY.orContinueWith} />
            <View style={styles.socialRow}>
              <Button
                variant="social"
                label={AUTH_COPY.apple}
                onPress={onApple}
                style={styles.socialBtn}
                leftSlot={
                  <Ionicons name="logo-apple" size={18} color={colors.onHero} />
                }
              />
              <Button
                variant="social"
                label={AUTH_COPY.google}
                onPress={onGoogle}
                style={styles.socialBtn}
                leftSlot={
                  <Ionicons name="logo-google" size={16} color={colors.onHero} />
                }
              />
            </View>
          </View>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.screenBottom) },
            ]}
          >
            <Pressable
              accessibilityRole="link"
              onPress={onCreateAccount}
              style={styles.footerRow}
            >
              <Text style={styles.footerMuted}>{AUTH_COPY.newHere} </Text>
              <Text style={styles.footerLink}>{AUTH_COPY.createAccount}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onContinueAsGuest}>
              <Text style={styles.guest}>{AUTH_COPY.continueAsGuest}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.hero,
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  watermarkWrap: {
    position: 'absolute',
    right: -30,
    top: 60,
  },
  watermark: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.watermark,
    color: colors.onHeroFaint,
    lineHeight: typography.fontSize.watermark,
  },
  header: {
    paddingTop: 80,
    gap: 16,
  },
  headerCopy: {
    gap: 6,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  socialBlock: {
    marginTop: 26,
    gap: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
    gap: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerMuted: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
  },
  footerLink: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHero,
    textDecorationLine: 'underline',
  },
  guest: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.onHeroMuted,
  },
});
