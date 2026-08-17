import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ReverseGeocodeResult } from '@/api/OrderBooking/modules/addresses';
import { Button, Field, FormError, Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';

const LABEL_KEYS = ['home', 'work', 'other'] as const;

type AddressLabelKey = (typeof LABEL_KEYS)[number];

function labelKeyFromSaved(
  label: string,
  labels: Record<AddressLabelKey, string>,
): AddressLabelKey {
  const trimmed = label.trim();
  for (const key of LABEL_KEYS) {
    if (labels[key] === trimmed) return key;
  }
  const lower = trimmed.toLowerCase();
  if (lower === 'home') return 'home';
  if (lower === 'work') return 'work';
  return 'other';
}

type AddressDetailsFormProps = {
  lookup: ReverseGeocodeResult;
  saving: boolean;
  errorMessage: string | null;
  initialLabelKey?: AddressLabelKey;
  initialFloor?: string;
  initialNotes?: string;
  savedLabel?: string;
  saveLabel?: string;
  onSave: (input: {
    label: string;
    line2: string;
    notes: string;
  }) => void;
};

export function AddressDetailsForm({
  lookup,
  saving,
  errorMessage,
  initialLabelKey = 'home',
  initialFloor,
  initialNotes = '',
  savedLabel,
  saveLabel,
  onSave,
}: AddressDetailsFormProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [labelKey, setLabelKey] = useState<AddressLabelKey>(() =>
    savedLabel
      ? labelKeyFromSaved(savedLabel, {
          home: t('menu.addressLabels.home'),
          work: t('menu.addressLabels.work'),
          other: t('menu.addressLabels.other'),
        })
      : initialLabelKey,
  );
  const [floor, setFloor] = useState(initialFloor ?? lookup.line2);
  const [notes, setNotes] = useState(initialNotes);

  const placeLine = [lookup.area, lookup.city].filter(Boolean).join(' · ');

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <Text style={styles.summaryEyebrow}>{t('menu.addressFound')}</Text>
        <Text style={styles.summaryTitle}>
          {lookup.line1 || lookup.formattedAddress}
        </Text>
        {placeLine ? (
          <Text style={styles.summaryMeta}>{placeLine}</Text>
        ) : lookup.formattedAddress && lookup.line1 ? (
          <Text style={styles.summaryMeta}>{lookup.formattedAddress}</Text>
        ) : null}
      </View>

      <View>
        <Text style={styles.groupLabel}>{t('menu.addressLabel')}</Text>
        <View style={styles.chips}>
          {LABEL_KEYS.map((key) => {
            const selected = key === labelKey;
            return (
              <Pressable
                key={key}
                onPress={() => setLabelKey(key)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {t(`menu.addressLabels.${key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field
        label={t('menu.addressFloor')}
        optionalHint={t('common.optional')}
        value={floor}
        onChangeText={setFloor}
        placeholder={t('menu.addressFloorPlaceholder')}
        autoCapitalize="words"
        returnKeyType="next"
        style={{ backgroundColor: colors.surface }}
      />

      <Field
        label={t('menu.addressNotes')}
        optionalHint={t('common.optional')}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('menu.addressNotesPlaceholder')}
        autoCapitalize="sentences"
        style={{ backgroundColor: colors.surface, height: 88, paddingTop: 14 }}
        multiline
        textAlignVertical="top"
      />

      <FormError message={errorMessage} />

      <Button
        label={saveLabel ?? t('menu.saveAddress')}
        onPress={() =>
          onSave({
            label: t(`menu.addressLabels.${labelKey}`),
            line2: floor.trim(),
            notes: notes.trim(),
          })
        }
        loading={saving}
        disabled={saving}
      />
    </View>
  );
}

const styles = createStyles((colors) => ({
  root: {
    gap: 16,
    paddingBottom: 8,
  },
  summary: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  summaryEyebrow: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
    lineHeight: 22,
  },
  summaryMeta: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  groupLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
    paddingLeft: 6,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.card,
  },
}));
