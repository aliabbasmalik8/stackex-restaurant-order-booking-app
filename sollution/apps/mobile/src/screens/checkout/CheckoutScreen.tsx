import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, Button, Text } from '@/components/ui';
import { PROFILE_USER, moneyFixed } from '@/data/mockMenu';
import { colors, radii, spacing, typography } from '@/theme';

const SLOTS = ['7:50 PM', '8:00 PM', '8:15 PM', 'After Isha 🕌'];

type WhenMode = 'asap' | 'schedule';
type PayMethod = 'card' | 'cash';

interface CheckoutScreenProps {
  total: number;
  onBack?: () => void;
  onPlaceOrder?: () => void;
}

export const CheckoutScreen = ({
  total,
  onBack,
  onPlaceOrder,
}: CheckoutScreenProps) => {
  const insets = useSafeAreaInsets();
  const [when, setWhen] = useState<WhenMode>('asap');
  const [slot, setSlot] = useState(SLOTS[0]);
  const [pay, setPay] = useState<PayMethod>('card');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={styles.title}>Pickup details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When</Text>
          <View style={styles.segment}>
            <Pressable
              onPress={() => setWhen('asap')}
              style={[styles.segBtn, when === 'asap' && styles.segActive]}
            >
              <Text
                style={[
                  styles.segLabel,
                  when === 'asap' && styles.segLabelActive,
                ]}
              >
                ASAP · 15 min
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setWhen('schedule')}
              style={[styles.segBtn, when === 'schedule' && styles.segActive]}
            >
              <Text
                style={[
                  styles.segLabel,
                  when === 'schedule' && styles.segLabelActive,
                  when !== 'schedule' && styles.segLabelIdle,
                ]}
              >
                Schedule
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.slots}
          >
            {SLOTS.map((s) => {
              const active = slot === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSlot(s)}
                  style={[styles.slot, active ? styles.slotOn : styles.slotOff]}
                >
                  <Text style={[styles.slotText, active && styles.slotTextOn]}>
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your info</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{PROFILE_USER.shortName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{PROFILE_USER.phone}</Text>
            </View>
          </View>
          <Text style={styles.hint}>
            We’ll WhatsApp you when it’s ready. No account needed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Pressable style={styles.applePay}>
            <Text style={styles.applePayText}> Pay</Text>
          </Pressable>
          <Pressable
            onPress={() => setPay('card')}
            style={[styles.payRow, pay === 'card' && styles.paySelected]}
          >
            <View style={styles.payBadge}>
              <Text style={styles.payBadgeText}>VISA</Text>
            </View>
            <Text style={styles.payLabel}>Emirates NBD ·· 4242</Text>
            <Text style={styles.change}>Change</Text>
          </Pressable>
          <Pressable
            onPress={() => setPay('cash')}
            style={[styles.payRow, pay === 'cash' && styles.paySelected]}
          >
            <View style={styles.payBadge}>
              <Text style={styles.payBadgeText}>CASH</Text>
            </View>
            <Text style={[styles.payLabel, styles.payLabelMuted]}>
              Pay at counter
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total incl. 5% VAT</Text>
          <Text style={styles.footerAmount}>{moneyFixed(total)}</Text>
        </View>
        <Button label="Place order" onPress={onPlaceOrder} />
      </View>
    </View>
  );
};

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
    paddingBottom: 20,
    gap: 20,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: typography.fontFamilyDisplaySemiBold,
    fontSize: 14.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segActive: {
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  segLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  segLabelActive: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  segLabelIdle: {
    color: colors.sub,
  },
  slots: { gap: 8 },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: radii.pill,
  },
  slotOn: { backgroundColor: colors.chipActiveBg },
  slotOff: {
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  slotText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  slotTextOn: {
    fontFamily: typography.fontFamilyExtraBold,
    fontWeight: typography.fontWeight.extrabold,
    color: '#fff',
  },
  infoCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
  infoBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.sub,
  },
  infoValue: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  hint: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  applePay: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applePayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  paySelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  payBadge: {
    width: 34,
    height: 23,
    borderRadius: 5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBadgeText: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 8,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.sub,
  },
  payLabel: {
    flex: 1,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
  payLabelMuted: {
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  change: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.link,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  footerLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.sub,
  },
  footerAmount: {
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.ink,
  },
});
