import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS_RADIUS, colors, isGlassMode, plateShadow, radius } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Warna bayangan keras (default tinta). */
  shadowColor?: string;
  /** Jarak offset bayangan (default 3). */
  shadowOffset?: number;
  /** True = render sebagai kartu kaca (tanpa warna cream). */
  glass?: boolean;
  /** True = kartu kaca dengan border glowing (seperti referensi UI). */
  glow?: boolean;
}

/**
 * Kartu plat cetak gaya ukiran: border tinta 1.5px, radius 4px,
 * bayangan keras offset tanpa blur.
 * Mode liquid-glass: kartu kaca tanpa bayangan (border terang, radius 18).
 * Prop glass: kartu kaca individual tanpa mengubah theme global.
 * Prop glow: blur lebih kuat + border glowing.
 */
export function Plate({ children, style, shadowColor, shadowOffset = plateShadow, glass = false, glow = false }: Props) {
  if (isGlassMode() || glass) {
    const cardContent = (
      <BlurView
        intensity={glow ? 90 : 35}
        tint={glow ? 'light' : 'dark'}
        style={{
          backgroundColor: glow ? 'rgba(255,255,255,0.03)' : 'rgba(40,60,140,0.18)',
          borderRadius: GLASS_RADIUS,
        }}
      >
        {children}
      </BlurView>
    );

    // Glow: border gradien biru-oranye di tiap sudut + blur putih transparan.
    if (glow) {
      return (
        <LinearGradient
          colors={['#4d7fff', '#f68c50', '#4d7fff', '#f68c50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              borderRadius: GLASS_RADIUS + 2,
              padding: 2,
              shadowColor: '#7fb3ff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 18,
              elevation: 8,
            },
            style,
          ]}
        >
          <View style={{ borderRadius: GLASS_RADIUS, overflow: 'hidden' }}>
            {cardContent}
          </View>
        </LinearGradient>
      );
    }

    // Dibaca saat render agar mengikuti setGlassMode().
    // Mengikuti style glass icon tab: subtle, transparan.
    return (
      <View
        style={[
          {
            borderRadius: GLASS_RADIUS,
            overflow: 'hidden',
            borderColor: 'rgba(140,180,255,0.25)',
            borderWidth: 1,
          },
          style,
        ]}
      >
        {cardContent}
      </View>
    );
  }
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.shadow,
          {
            backgroundColor: shadowColor ?? colors.etch,
            borderRadius: radius.card,
            top: shadowOffset,
            left: shadowOffset,
          },
        ]}
      />
      <View style={styles.plate}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  shadow: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
  plate: {
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: radius.card,
    borderWidth: 1.5,
  },
});
