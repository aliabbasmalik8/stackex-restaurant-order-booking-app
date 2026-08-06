import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BackButton,
  Button,
  Checkbox,
  Field,
  PhoneField,
  Text,
} from '@/components/ui';
import { AUTH_COPY } from '@/constants';
import { colors, spacing, typography } from '@/theme';

export interface SignUpValues {
  name: string;
  phone: string;
  email: string;
  whatsappOffers: boolean;
}

interface SignUpScreenProps {
  onBack?: () => void;
  onSubmit?: (values: SignUpValues) => void;
}

export const SignUpScreen = ({ onBack, onSubmit }: SignUpScreenProps) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappOffers, setWhatsappOffers] = useState(true);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 7;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BackButton onPress={onBack} />
          </View>

          <View style={styles.header}>
            <Text variant="title">{AUTH_COPY.signUpTitle}</Text>
            <Text variant="subtitle" color={colors.textSecondary}>
              {AUTH_COPY.signUpSubtitle}
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label={AUTH_COPY.fullName}
              value={name}
              onChangeText={setName}
              placeholder={AUTH_COPY.namePlaceholder}
              autoCapitalize="words"
            />
            <PhoneField
              variant="surface"
              label={AUTH_COPY.phone}
              value={phone}
              onChangeText={setPhone}
              placeholder={AUTH_COPY.phonePlaceholder}
            />
            <Field
              label={AUTH_COPY.email}
              optionalHint={AUTH_COPY.emailOptional}
              value={email}
              onChangeText={setEmail}
              placeholder={AUTH_COPY.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Checkbox
              checked={whatsappOffers}
              onChange={setWhatsappOffers}
              label={AUTH_COPY.whatsappOffers}
            />
          </View>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.screenBottom) },
            ]}
          >
            <Button
              label={AUTH_COPY.createAccountCta}
              disabled={!canSubmit}
              onPress={() =>
                onSubmit?.({
                  name: name.trim(),
                  phone: phone.trim(),
                  email: email.trim(),
                  whatsappOffers,
                })
              }
            />
            <Text style={styles.legal}>
              {AUTH_COPY.termsPrefix}
              <Text style={styles.legalLink}>{AUTH_COPY.terms}</Text>
              {AUTH_COPY.and}
              <Text style={styles.legalLink}>{AUTH_COPY.privacy}</Text>
            </Text>
          </View>
        </ScrollView>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  topBar: {
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 10,
    gap: 5,
  },
  form: {
    marginTop: 24,
    gap: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 28,
    gap: 14,
  },
  legal: {
    textAlign: 'center',
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    lineHeight: 18,
  },
  legalLink: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
});
