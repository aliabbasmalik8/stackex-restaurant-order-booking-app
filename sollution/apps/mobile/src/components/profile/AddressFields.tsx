import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Field, Text } from '@/components/ui';
import type { UserAddress } from '@/core/profile';
import { colors, typography } from '@/theme';

type AddressFieldsProps = {
  value: UserAddress;
  onChange: (next: UserAddress) => void;
  /** Read-only summary (checkout). */
  readOnly?: boolean;
};

/**
 * Shared address editor / summary for Edit Profile and Checkout.
 */
export function AddressFields({
  value,
  onChange,
  readOnly,
}: AddressFieldsProps) {
  const { t } = useTranslation();

  if (readOnly) {
    const line = [value.line1, value.line2, value.area, value.city]
      .map((p) => p?.trim())
      .filter(Boolean)
      .join(', ');
    const notes = value.notes?.trim();
    return (
      <View style={styles.readOnly}>
        <Text style={styles.readOnlyText}>
          {line || t('profile.addressEmpty')}
        </Text>
        {notes ? <Text style={styles.readOnlyNotes}>{notes}</Text> : null}
      </View>
    );
  }

  const patch = (partial: Partial<UserAddress>) =>
    onChange({ ...value, ...partial });

  return (
    <View style={styles.form}>
      <Field
        label={t('profile.addressLine1')}
        value={value.line1}
        onChangeText={(line1) => patch({ line1 })}
        placeholder={t('profile.addressLine1Placeholder')}
        autoCapitalize="words"
      />
      <Field
        label={t('profile.addressLine2')}
        optionalHint={t('common.optional')}
        value={value.line2 ?? ''}
        onChangeText={(line2) => patch({ line2 })}
        placeholder={t('profile.addressLine2Placeholder')}
        autoCapitalize="words"
      />
      <Field
        label={t('profile.addressArea')}
        optionalHint={t('common.optional')}
        value={value.area ?? ''}
        onChangeText={(area) => patch({ area })}
        placeholder={t('profile.addressAreaPlaceholder')}
        autoCapitalize="words"
      />
      <Field
        label={t('profile.addressCity')}
        value={value.city}
        onChangeText={(city) => patch({ city })}
        placeholder={t('profile.addressCityPlaceholder')}
        autoCapitalize="words"
      />
      <Field
        label={t('profile.addressNotes')}
        optionalHint={t('common.optional')}
        value={value.notes ?? ''}
        onChangeText={(notes) => patch({ notes })}
        placeholder={t('profile.addressNotesPlaceholder')}
        autoCapitalize="sentences"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  readOnly: { gap: 4 },
  readOnlyText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    lineHeight: 20,
  },
  readOnlyNotes: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    lineHeight: 18,
  },
});
