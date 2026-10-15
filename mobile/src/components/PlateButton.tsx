import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GLASS_RADIUS, colors, fontFamily, isGlassMode, radius } from '../theme';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  /** 'primary' (indigo tua) | 'paper' (kertas ber-border tinta) | 'danger' */
  variant?: 'primary' | 'paper' | 'danger';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Paksa gaya kaca (seperti prop glass di Plate). */
  glass?: boolean;
}

/**
 * Tombol cap gaya ukiran: uppercase, letter-spacing, radius 3px,
 * border tinta 1.5px, bayangan keras 4px.
 */
export function PlateButton({ children, onPress, variant = 'primary', style, disabled, glass: glassProp = false }: Props) {
  const glass = isGlassMode() || glassProp;
  const bg =
    glass && variant === 'primary'
      ? 'rgba(246,140,80,0.45)'
      : variant === 'primary'
        ? colors.indigoDark
        : variant === 'danger'
          ? colors.reject
          : colors.surface;
  const fg = variant === 'paper' && !glass ? colors.etch : '#ffffff';
  const label =
    typeof children === 'string' ? (
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    ) : (
      children
    );
  // Mode liquid-glass: tombol kaca tanpa bayangan keras.
  // Saat ditekan: background jadi solid orange + halo border neon orange.
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  if (glass) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            backgroundColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [bg, '#f68c50'],
            }),
            borderColor: 'rgba(255,255,255,0.35)',
            borderRadius: GLASS_RADIUS,
            borderWidth: 1,
            opacity: disabled ? 0.6 : 1,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {/* Halo border neon orange saat ditekan */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderColor: '#f68c50',
              borderRadius: GLASS_RADIUS,
              borderWidth: 2,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              shadowColor: '#f68c50',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              shadowRadius: 24,
            },
          ]}
        />
        {label}
      </TouchableOpacity>
    );
  }
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
