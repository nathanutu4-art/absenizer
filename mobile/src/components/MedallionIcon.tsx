import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MEDALLION_CREAM, MEDALLION_INK } from '../data/medallions';
import {
  MEDALLION_GRAY_INK,
  MEDALLION_GRAY_WADA_APRICOT,
  MEDALLION_GRAY_WADA_INDIGO,
  MEDALLION_GRAY_WADA_OLIVE,
} from '../data/medallions-gray';
import { AppIcon } from './AppIcon';
import type { IconName } from '../data/icons';
import { colors, isGlassMode } from '../theme';

export type MedallionVariant =
  | 'ink'
  | 'cream'
  | 'wadaIndigo'
  | 'wadaApricot'
  | 'wadaOlive';

interface Props {
  /** Nama glyph (feather-style). */
  glyph: IconName;
  /** Diameter medali. */
  size?: number;
  /**
   * Varian warna: 'ink'/'cream' (monokrom ukiran),
   * 'wadaIndigo'/'wadaApricot'/'wadaOlive' (palet tema dinamis,
   * dapat diganti HR dari panel admin).
   */
  variant?: MedallionVariant;
  style?: StyleProp<ViewStyle>;
}

/** Ring tetap untuk varian monokrom. */
const FIXED_RINGS: Record<'ink' | 'cream', string> = {
  ink: MEDALLION_INK,
  cream: MEDALLION_CREAM,
};

/** Ring dasar grayscale untuk varian palet dinamis (di-tint saat render). */
const GRAY_RINGS: Record<'wadaIndigo' | 'wadaApricot' | 'wadaOlive', string> = {
  wadaIndigo: MEDALLION_GRAY_WADA_INDIGO,
  wadaApricot: MEDALLION_GRAY_WADA_APRICOT,
  wadaOlive: MEDALLION_GRAY_WADA_OLIVE,
};

/** Warna tint dinamis — dibaca saat render agar mengikuti applyPalette(). */
function ringTint(variant: MedallionVariant): string | undefined {
  switch (variant) {
    case 'wadaIndigo':
      return colors.wadaIndigo;
    case 'wadaApricot':
      return colors.wadaApricot;
    case 'wadaOlive':
      return colors.wadaOlive;
    default:
      return undefined;
  }
}

/** Warna glyph yang kontras di atas tiap varian ring. */
const GLYPH_COLORS: Record<MedallionVariant, string> = {
  ink: colors.etch,
  cream: colors.surface,
  wadaIndigo: colors.etch,
  wadaApricot: '#ffffff',
  wadaOlive: colors.etch,
};

/**
 * Ikon medali ukiran: cincin ganda berarsir + glyph di tengah,
 * mengikuti hi-fi gaya engraving. Varian wada mengikuti palet tema
 * dinamis (default Sanzo Wada No. 211; HR dapat mengganti dari panel
 * admin — dimuat saat aplikasi dibuka).
 */
export function MedallionIcon({ glyph, size = 44, variant = 'ink', style }: Props) {
  const glyphSize = Math.round(size * 0.38);
  // Mode liquid-glass: ring putih + glyph putih (eksperimen, mudah di-revert).
  if (isGlassMode()) {
    const base =
      variant === 'ink'
        ? MEDALLION_GRAY_INK
        : variant === 'cream'
          ? MEDALLION_GRAY_WADA_INDIGO
          : GRAY_RINGS[variant];
    return (
      <View style={[{ height: size, width: size }, style]}>
        <Image
          source={{ uri: base }}
          style={[StyleSheet.absoluteFill, { tintColor: 'rgba(255,255,255,0.9)' }]}
        />
        <View style={styles.center}>
          <AppIcon color="#ffffff" name={glyph} size={glyphSize} />
        </View>
      </View>
    );
  }
  const ring =
    variant === 'ink' || variant === 'cream' ? (
      <Image source={{ uri: FIXED_RINGS[variant] }} style={StyleSheet.absoluteFill} />
    ) : (
      <Image
        source={{ uri: GRAY_RINGS[variant] }}
        style={[StyleSheet.absoluteFill, { tintColor: ringTint(variant) }]}
      />
    );
  return (
    <View style={[{ height: size, width: size }, style]}>
      {ring}
      <View style={styles.center}>
        <AppIcon color={GLYPH_COLORS[variant]} name={glyph} size={glyphSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
