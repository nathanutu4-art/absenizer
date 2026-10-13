import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontFamily, radius } from '../theme';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  /** 'primary' (indigo tua) | 'paper' (kertas ber-border tinta) | 'danger' */
  variant?: 'primary' | 'paper' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Tombol cap gaya ukiran: uppercase, letter-spacing, radius 3px,
 * border tinta 1.5px, bayangan keras 4px.
 */
export function PlateButton({ children, onPress, variant = 'primary', style, disabled }: Props) {
  const bg =
    variant === 'primary' ? colors.indigoDark : variant === 'danger' ? colors.reject : colors.surface;
  const fg = variant === 'paper' ? colors.etch : '#ffffff';
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.shadow, { backgroundColor: colors.etchDeep }]} />
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.6 : 1 }]}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, { color: fg }]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  shadow: {
    borderRadius: radius.button,
    bottom: 0,
    left: 4,
    position: 'absolute',
    right: 0,
    top: 4,
  },
  button: {
    alignItems: 'center',
    borderColor: colors.etchDeep,
    borderRadius: radius.button,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: fontFamily('700'),
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
