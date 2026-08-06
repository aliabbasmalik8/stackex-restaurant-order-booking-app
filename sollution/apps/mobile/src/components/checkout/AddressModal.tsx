import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, FormError, Text } from '@/components/ui';
import { AddressFields } from '@/components/profile/AddressFields';
import {
  emptyAddress,
  hasAddress,
  type UserAddress,
} from '@/modules/profile';
import { colors, radii, spacing, typography } from '@/theme';

type AddressModalProps = {
  visible: boolean;
  /** Prefill when opening (profile or order-scoped draft). */
  initial: UserAddress | null;
  onClose: () => void;
  /** Apply to this order only — do not write profile. */
  onDone: (address: UserAddress) => void;
  /** Write profile, then apply to this order. Omit to hide “Save to profile”. */
  onSaveAndDone?: (address: UserAddress) => void | Promise<void>;
};

export function AddressModal({
  visible,
  initial,
  onClose,
  onDone,
  onSaveAndDone,
}: AddressModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<UserAddress>(emptyAddress());
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = hasAddress(initial);
  const canSubmit = hasAddress(draft) && !saving;

  useEffect(() => {
    if (!visible) return;
    setDraft(initial ?? emptyAddress());
    setErrorMessage(null);
    setSaving(false);
  }, [visible, initial]);

  const cleaned = (): UserAddress | null => {
    if (!hasAddress(draft)) return null;
    const next: UserAddress = {
      line1: draft.line1.trim(),
      city: draft.city.trim(),
    };
    const line2 = draft.line2?.trim();
    const area = draft.area?.trim();
    const notes = draft.notes?.trim();
    if (line2) next.line2 = line2;
    if (area) next.area = area;
    if (notes) next.notes = notes;
    return next;
  };

  const handleDone = () => {
    const address = cleaned();
    if (!address) {
      setErrorMessage(t('checkout.addressIncomplete'));
      return;
    }
    onDone(address);
  };

  const handleSaveAndDone = async () => {
    if (!onSaveAndDone) return;
    const address = cleaned();
    if (!address) {
      setErrorMessage(t('checkout.addressIncomplete'));
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSaveAndDone(address);
    } catch {
      setErrorMessage(t('errors.unknown.message'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>
              {isEdit
                ? t('checkout.addressModalEditTitle')
                : t('checkout.addressModalAddTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {t('checkout.addressModalSubtitle')}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              <AddressFields value={draft} onChange={setDraft} />
            </ScrollView>

            <FormError message={errorMessage} />

            <View style={styles.actions}>
              <Pressable
                onPress={handleDone}
                disabled={!canSubmit}
                style={[styles.secondaryBtn, !canSubmit && styles.disabled]}
              >
                <Text style={styles.secondaryLabel}>
                  {t('checkout.addressDone')}
                </Text>
                <Text style={styles.secondaryHint}>
                  {t('checkout.addressDoneHint')}
                </Text>
              </Pressable>
              {onSaveAndDone ? (
                <Button
                  label={t('checkout.addressSaveAndDone')}
                  onPress={() => void handleSaveAndDone()}
                  loading={saving}
                  disabled={!canSubmit}
                />
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,34,56,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screenX,
    paddingTop: 10,
    maxHeight: '92%',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
    marginBottom: 14,
  },
  scroll: { maxHeight: 360 },
  scrollContent: { paddingBottom: 8 },
  actions: { gap: 10, marginTop: 12 },
  secondaryBtn: {
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 2,
  },
  secondaryLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  secondaryHint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  disabled: { opacity: 0.45 },
});
