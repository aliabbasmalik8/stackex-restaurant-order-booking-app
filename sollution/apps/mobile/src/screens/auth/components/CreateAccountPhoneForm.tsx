import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Field,
  PhoneField,
  Text,
} from '@/components/ui';
import {
  getServiceStatus,
  isServiceInteractive,
} from '@/modules/services';
import { colors, typography } from '@/theme';

export type CreateAccountPhoneValues = {
  name: string;
  phone: string;
  email: string;
  whatsappOffers: boolean;
};

type CreateAccountPhoneFormProps = {
  onSubmit?: (values: CreateAccountPhoneValues) => void;
};

/**
 * Phone OTP create-account flow. Kept for later — gated by `createAccountPhone`
 * (hidden in preview).
 */
export function CreateAccountPhoneForm({
  onSubmit,
}: CreateAccountPhoneFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappOffers, setWhatsappOffers] = useState(true);
  const status = getServiceStatus('createAccountPhone');
  const interactive = isServiceInteractive('createAccountPhone');

  const canSubmit =
    interactive && name.trim().length > 1 && phone.trim().length >= 7;

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
        <PhoneField
          variant="surface"
          label={t('auth.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.phonePlaceholder')}
          editable={interactive}
        />
        <Field
          label={t('auth.email')}
          optionalHint={t('auth.emailOptional')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={interactive}
        />
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
            phone: phone.trim(),
            email: email.trim(),
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
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
