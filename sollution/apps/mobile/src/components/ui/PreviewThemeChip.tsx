import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/Text';
import { isPreviewMode } from '@/lib/previewMode';
import {
  PALETTE_GROUPS,
  palettes,
  radii,
  spacing,
  typography,
  useTheme,
  type PaletteId,
} from '@/theme';

export const PALETTE_LABEL_KEYS: Record<PaletteId, string> = {
  charcoal: 'preview.palettes.charcoal',
  red: 'preview.palettes.red',
  dark: 'preview.palettes.dark',
  emerald: 'preview.palettes.emerald',
  saffron: 'preview.palettes.saffron',
  midnight: 'preview.palettes.midnight',
  olive: 'preview.palettes.olive',
};

const GROUP_LABEL_KEYS: Record<(typeof PALETTE_GROUPS)[number]['id'], string> = {
  warm: 'preview.paletteGroups.warm',
  cool: 'preview.paletteGroups.cool',
  earth: 'preview.paletteGroups.earth',
  darkUi: 'preview.paletteGroups.darkUi',
};

function shouldShowPreviewThemeChip(): boolean {
  return isPreviewMode();
}

type PreviewThemeModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function PreviewThemeModal({ visible, onClose }: PreviewThemeModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, paletteId, setPaletteId } = useTheme();

  const select = (id: PaletteId) => {
    setPaletteId(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.root}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View
          style={[
            modalStyles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: Math.max(insets.bottom, 20),
              shadowColor: colors.ink,
            },
          ]}
        >
          <View
            style={[modalStyles.handle, { backgroundColor: colors.border }]}
          />
          <Text style={[modalStyles.title, { color: colors.ink }]}>
            {t('preview.themeTitle')}
          </Text>
          <Text style={[modalStyles.subtitle, { color: colors.sub }]}>
            {t('preview.themeSubtitle')}
          </Text>

          <ScrollView
            style={modalStyles.listScroll}
            contentContainerStyle={modalStyles.list}
            showsVerticalScrollIndicator={false}
          >
            {PALETTE_GROUPS.map((group, groupIndex) => (
              <View key={group.id} style={modalStyles.group}>
                <View
                  style={[
                    modalStyles.groupHead,
                    groupIndex > 0 && [
                      modalStyles.groupHeadDivider,
                      { borderTopColor: colors.divider },
                    ],
                  ]}
                >
                  <Text
                    style={[modalStyles.groupLabel, { color: colors.muted }]}
                  >
                    {t(GROUP_LABEL_KEYS[group.id])}
                  </Text>
                </View>
                {group.ids.map((id) => {
                  const active = id === paletteId;
                  const swatch = palettes[id].ctaBg;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => select(id)}
                      style={[
                        modalStyles.row,
                        { backgroundColor: colors.surface },
                        active && {
                          backgroundColor: colors.card,
                          borderWidth: 1.5,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <View
                        style={[modalStyles.swatch, { backgroundColor: swatch }]}
                      />
                      <Text
                        style={[
                          modalStyles.rowTitle,
                          { color: colors.ink, flex: 1 },
                        ]}
                      >
                        {t(PALETTE_LABEL_KEYS[id])}
                      </Text>
                      <View
                        style={[
                          modalStyles.radio,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        {active ? (
                          <View
                            style={[
                              modalStyles.radioDot,
                              { backgroundColor: colors.primary },
                            ]}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={[modalStyles.done, { backgroundColor: colors.primary }]}
          >
            <Text style={[modalStyles.doneText, { color: colors.onPrimary }]}>
              {t('languages.done')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type ChipTone = 'hero' | 'light';

type PreviewThemeChipProps = {
  /** `hero` for dark auth surfaces; `light` for light pages. */
  tone?: ChipTone;
};

/**
 * Preview-only palette chip (native + web).
 * Web iframe hosts can also set the palette via postMessage.
 */
export function PreviewThemeChip({ tone = 'hero' }: PreviewThemeChipProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  if (!shouldShowPreviewThemeChip()) return null;

  const hero = tone === 'hero';
  const chipColor = hero ? colors.onHero : colors.ink;
  const chipBg = hero ? colors.heroGlassFill : colors.card;
  const chipBorder = hero ? colors.heroGlassBorder : colors.border;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('preview.themeChip')}
        onPress={() => setOpen(true)}
        style={[
          chipStyles.chip,
          {
            backgroundColor: chipBg,
            borderColor: chipBorder,
          },
        ]}
      >
        <Ionicons name="color-palette-outline" size={16} color={chipColor} />
        <Text style={[chipStyles.label, { color: chipColor }]}>
          {t('preview.themeChip')}
        </Text>
      </Pressable>
      <PreviewThemeModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
  },
});

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,34,56,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.screenX,
    paddingTop: 10,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamilyDisplay,
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 18,
  },
  listScroll: {
    maxHeight: 420,
  },
  list: { gap: 4, paddingBottom: 4 },
  group: { gap: 8 },
  groupHead: {
    paddingBottom: 2,
  },
  groupHeadDivider: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  groupLabel: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  rowTitle: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  done: {
    marginTop: 18,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
  },
});
