import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
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
}

/**
 * Kartu plat cetak gaya ukiran: border tinta 1.5px, radius 4px,
 * bayangan keras offset tanpa blur.
 * Mode liquid-glass: kartu kaca tanpa bayangan (border terang, radius 18).
 * Prop glass: kartu kaca individual tanpa mengubah theme global.
 */
export function Plate({ children, style, shadowColor, shadowOffset = plateShadow, glass = false }: Props) {
  if (isGlassMode() || glass) {
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
        <BlurView
          intensity={35}
          tint="dark"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {children}
        </BlurView>
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
