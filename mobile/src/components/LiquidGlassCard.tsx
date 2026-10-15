import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type LiquidGlassCardProps = {
  children: React.ReactNode;
  /** 'light' | 'dark' — tint untuk BlurView */
  tint?: 'light' | 'dark';
  /** intensitas blur, default 40 */
  intensity?: number;
  /** radius sudut, default 24 */
  borderRadius?: number;
  /** aktifkan efek press (scale 0.98), default true */
  pressable?: boolean;
  /** onPress handler — jika ada, card jadi bisa ditekan */
  onPress?: () => void;
  /** warna overlay transparan di atas blur (mis. tint indigo), default transparan */
  overlayColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * LiquidGlassCard — kartu kaca cair ala iOS liquid glass,
 * dibuat murni dengan expo-blur + expo-linear-gradient.
 * Aman di Expo Go (tanpa native module tambahan).
 *
 * Lapisan (dari bawah ke atas):
 *  1. Drop shadow lembut
 *  2. BlurView frosted (intensity 40)
 *  3. Sheen diagonal halus (kilau cahaya)
 *  4. Konten
 */
export function LiquidGlassCard({
  children,
  tint = 'light',
  intensity = 40,
  borderRadius = 24,
  pressable = true,
  onPress,
  overlayColor = 'transparent',
  style,
  contentStyle,
}: LiquidGlassCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const sheenOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!pressable) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }),
      Animated.timing(sheenOpacity, {
        toValue: 0.6,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!pressable) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
      Animated.timing(sheenOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const CardWrapper = onPress ? Pressable : View;

  return (
    <Animated.View
      style={[
        styles.shadow,
        { borderRadius },
        { transform: [{ scale }] },
        style,
      ]}
    >
      <CardWrapper
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ borderRadius }}
      >
        {/* 2. Frosted backdrop */}
        <BlurView
          intensity={intensity}
          tint={tint}
          style={[styles.blur, { borderRadius }]}
        >
            {/* 2b. Overlay warna (mis. tint indigo) */}
            {overlayColor !== 'transparent' ? (
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
                pointerEvents="none"
              />
            ) : null}
            {/* 3. Liquid sheen diagonal — halus */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: sheenOpacity }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.15)', // atas-kiri
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.01)', // bawah-kanan
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* 4. Konten */}
            <View style={[styles.content, contentStyle]}>{children}</View>
          </BlurView>
      </CardWrapper>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    // Depth — bayangan lembut menyebar
    shadowColor: '#051230',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
