import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { radii, typography, createStyles, useTheme } from '@/theme';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  textContentType?: 'password' | 'newPassword';
};

export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  textContentType = 'password',
}: PasswordFieldProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={!visible}
          textContentType={textContentType}
          autoComplete={
            textContentType === 'newPassword' ? 'password-new' : 'password'
          }
          editable={editable}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visible ? t('auth.hidePassword') : t('auth.showPassword')
          }
          onPress={() => setVisible((v) => !v)}
          style={styles.eye}
          disabled={!editable}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles((colors) => ({
  block: { gap: 6 },
  label: {
    paddingLeft: 6,
    fontFamily: typography.fontFamilyExtraBold,
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  field: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamilyBold,
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    paddingVertical: 0,
  },
  eye: { padding: 4 },
}));
