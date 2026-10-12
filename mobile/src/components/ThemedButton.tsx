import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontFamily, radius } from '../theme';
import { GradientView } from './GradientView';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'clockOut' | 'success' | 'outline' | 'dangerOutline' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tombol standar AbsensiKu.
 * - primary: gradasi 135deg #2f7ed0 -> #0057ba, radius 14.
 * - clockOut: gradasi #f59e0b -> #d97706.
 * - outline: garis indigo; danger: merah solid; ghost: teks indigo.
 */
export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.indigo
      : variant === 'dangerOutline'
        ? colors.red
        : '#ffffff';

  const inner = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
  );

  if (variant === 'primary' || variant === 'clockOut') {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        disabled={isDisabled}
        onPress={onPress}
        style={[isDisabled && styles.disabled, style]}
      >
        <GradientView
          imageStyle={{ borderRadius: radius.button }}
          kind={variant === 'primary' ? 'primary' : 'clockOut'}
          style={[styles.base, styles.gradientBase]}
        >
          {inner}
        </GradientView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        variant === 'outline' && styles.outline,
        variant === 'dangerOutline' && styles.dangerOutline,
        variant === 'danger' && styles.danger,
        variant === 'success' && styles.success,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.button,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  gradientBase: {
    // ImageBackground butuh tinggi eksplisit agar gradasi ter-stretch penuh.
    minHeight: 52,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.indigo,
    borderWidth: 1.5,
  },
  dangerOutline: {
    backgroundColor: 'transparent',
    borderColor: '#f3c2c2',
    borderWidth: 1.5,
  },
  danger: { backgroundColor: colors.red },
  success: { backgroundColor: colors.green },
  text: { fontFamily: fontFamily('700'), fontSize: 16 },
  disabled: { opacity: 0.5 },
});
