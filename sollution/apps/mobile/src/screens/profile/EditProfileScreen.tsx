import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BackButton, Button, Field, FormError, Text } from '@/components/ui';
import { AddressFields } from '@/components/profile/AddressFields';
import { useAuth } from '@/context/AuthContext';
import { toAppError, errorMessageKey, getErrorMessage } from '@/lib/errors';
import { emptyAddress, type UserAddress } from '@/core/profile';
import { colors, spacing, typography } from '@/theme';

type EditProfileScreenProps = {
  onBack?: () => void;
  onSaved?: () => void;
};

export function EditProfileScreen({ onBack, onSaved }: EditProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profile, updateUserProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState<UserAddress>(
    profile?.address ?? emptyAddress(),
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSave = name.trim().length > 1 && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateUserProfile({
        displayName: name.trim(),
        contactPhone: phone.trim() || null,
        address: {
          line1: address.line1,
          line2: address.line2,
          area: address.area,
          city: address.city,
          notes: address.notes,
        },
      });
      onSaved?.();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, t(errorMessageKey(toAppError(error).code))),
      );
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
        <Text style={styles.title}>{t('profile.editTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('profile.sectionContact')}</Text>
        <Field
          label={t('auth.fullName')}
          value={name}
          onChangeText={setName}
          placeholder={t('auth.namePlaceholder')}
          autoCapitalize="words"
        />
        <Field
          label={t('profile.contactPhone')}
          optionalHint={t('common.optional')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
        />
        {profile?.email ? (
          <View style={styles.emailBlock}>
            <Text style={styles.emailLabel}>{t('profile.emailReadOnly')}</Text>
            <Text style={styles.emailValue}>{profile.email}</Text>
            <Text style={styles.emailHint}>{t('profile.emailFromAuth')}</Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
          {t('profile.sectionAddress')}
        </Text>
        <AddressFields value={address} onChange={setAddress} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <FormError message={errorMessage} />
        <Button
          label={t('profile.save')}
          onPress={() => void onSave()}
          loading={saving}
          disabled={!canSave}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    marginBottom: 2,
  },
  sectionSpaced: { marginTop: 10 },
  emailBlock: { gap: 6, paddingLeft: 6 },
  emailLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  emailValue: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
  },
  emailHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
});
