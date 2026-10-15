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
 *  1. Halo glow (gradient indigo kiri-atas → orange kanan-bawah, menyebar ke luar)
 *  2. Border gradient glowing 2px (indigo terang kiri-atas → orange terang kanan-bawah)
 *  3. BlurView frosted (intensity 40)
 *  4. Sheen diagonal (kilau cahaya melengkung)
 *  5. Konten
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
        { borderRadius: borderRadius + GLOW_SPREAD },
        { transform: [{ scale }] },
        style,
      ]}
    >
      {/* 1. Halo glow — gradient menyebar ke luar card */}
      <LinearGradient
        colors={[
          'rgba(77,127,255,0.65)', // indigo kiri-atas
          'rgba(77,127,255,0.15)',
          'rgba(246,140,80,0.15)',
          'rgba(246,140,80,0.65)', // orange kanan-bawah
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: borderRadius + GLOW_SPREAD },
        ]}
      />
      <View style={{ padding: GLOW_SPREAD }}>
        <CardWrapper
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ borderRadius }}
        >
          {/* 2. Border glowing 2px — indigo kiri-atas → orange kanan-bawah */}
          <LinearGradient
            colors={[
              '#6d9bff', // indigo terang kiri-atas
              'rgba(109,155,255,0.55)',
              'rgba(246,140,80,0.55)',
              '#f68c50', // orange terang kanan-bawah
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.rim, { borderRadius, padding: 2 }]}
          >
          {/* 3. Frosted backdrop */}
          <BlurView
            intensity={intensity}
            tint={tint}
            style={[styles.blur, { borderRadius: borderRadius - 2 }]}
          >
            {/* 3b. Overlay warna (mis. tint indigo) */}
            {overlayColor !== 'transparent' ? (
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
                pointerEvents="none"
              />
            ) : null}
            {/* 4. Liquid sheen diagonal */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: sheenOpacity }]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.35)', // atas-kiri
                  'rgba(255,255,255,0.12)',
                  'rgba(255,255,255,0.03)', // bawah-kanan
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* 5. Konten */}
            <View style={[styles.content, contentStyle]}>{children}</View>
          </BlurView>
        </LinearGradient>
      </CardWrapper>
      </View>
    </Animated.View>
  );
}

/** Seberapa jauh halo glow menyebar ke luar card */
const GLOW_SPREAD = 10;

const styles = StyleSheet.create({
  shadow: {
    // Depth — bayangan lembut menyebar (halo gradient di atas menangani glow warna)
    shadowColor: '#051230',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  rim: {
    overflow: 'hidden',
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
