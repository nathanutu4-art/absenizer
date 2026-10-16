import React, { useRef, useState } from 'react';
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
  /** 'primary' (indigo tua) | 'paper' (kertas ber-border tinta) | 'danger' | 'accent' (oranye solid + animasi) */
  variant?: 'primary' | 'paper' | 'danger' | 'accent';
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
  const isAccent = variant === 'accent' && !glass;
  const bg =
    glass && variant === 'primary'
      ? 'rgba(246,140,80,0.45)'
      : isAccent
        ? '#f68c50'
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
  // Accent: animasi scale saat ditekan (spring, native driver).
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
    if (isAccent) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        speed: 30,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (isAccent) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 20,
        bounciness: 6,
        useNativeDriver: true,
      }).start();
    }
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
            backgroundColor: pressed ? '#f68c50' : bg,
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
    <Animated.View
      style={[
        styles.wrap,
        style,
        isAccent && { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {isAccent ? null : (
        <View style={[styles.shadow, { backgroundColor: colors.etchDeep }]} />
      )}
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        onPressIn={isAccent ? handlePressIn : undefined}
        onPressOut={isAccent ? handlePressOut : undefined}
        style={[
          styles.button,
          {
            backgroundColor: bg,
            borderColor: isAccent ? '#d9732f' : colors.etchDeep,
            borderRadius: isAccent ? 14 : radius.button,
            opacity: disabled ? 0.6 : 1,
          },
          isAccent && {
            shadowColor: '#f68c50',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 16,
            elevation: 6,
          },
        ]}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, { color: fg }]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
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
