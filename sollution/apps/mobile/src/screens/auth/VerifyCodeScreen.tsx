import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, Button, OtpInput, Text } from '@/components/ui';
import { AUTH_COPY } from '@/constants';
import { brand, colors, spacing, typography } from '@/theme';

interface VerifyCodeScreenProps {
  phone?: string;
  onBack?: () => void;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  onChangeNumber?: () => void;
}

export const VerifyCodeScreen = ({
  phone = `${brand.dialCode} ${AUTH_COPY.phonePlaceholder}`,
  onBack,
  onVerify,
  onResend,
  onChangeNumber,
}: VerifyCodeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <BackButton onPress={onBack} />

          <View style={styles.header}>
            <Text variant="title">{AUTH_COPY.verifyTitle}</Text>
            <Text variant="subtitle" color={colors.textSecondary}>
              {AUTH_COPY.verifySubtitle(phone)}
            </Text>
          </View>

          <View style={styles.otp}>
            <OtpInput value={code} onChange={setCode} />
          </View>

          <Pressable onPress={onChangeNumber} style={styles.change}>
            <Text style={styles.changeText}>{AUTH_COPY.changeNumber}</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.screenBottom) },
          ]}
        >
          <Button
            label={AUTH_COPY.verifyCta}
            disabled={code.length < 4}
            onPress={() => onVerify?.(code)}
          />
          <Pressable onPress={onResend} style={styles.resend}>
            <Text style={styles.resendText}>{AUTH_COPY.resend}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 28,
    gap: 8,
  },
  otp: {
    marginTop: 32,
  },
  change: {
    marginTop: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },
  changeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  footer: {
    paddingHorizontal: spacing.screenX,
    gap: 14,
  },
  resend: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
});
