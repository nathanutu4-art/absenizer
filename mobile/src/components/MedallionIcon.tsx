import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  MEDALLION_CREAM,
  MEDALLION_INK,
  MEDALLION_WADA_APRICOT,
  MEDALLION_WADA_INDIGO,
  MEDALLION_WADA_OLIVE,
} from '../data/medallions';
import { AppIcon } from './AppIcon';
import type { IconName } from '../data/icons';
import { colors } from '../theme';

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
   * 'wadaIndigo'/'wadaApricot'/'wadaOlive' (Sanzo Wada No. 211).
   */
  variant?: MedallionVariant;
  style?: StyleProp<ViewStyle>;
}

const RINGS: Record<MedallionVariant, string> = {
  ink: MEDALLION_INK,
  cream: MEDALLION_CREAM,
  wadaIndigo: MEDALLION_WADA_INDIGO,
  wadaApricot: MEDALLION_WADA_APRICOT,
  wadaOlive: MEDALLION_WADA_OLIVE,
};

/** Warna glyph yang kontras di atas tiap varian ring. */
const GLYPH_COLORS: Record<MedallionVariant, string> = {
  ink: colors.etch,
  cream: colors.surface,
  wadaIndigo: colors.surface,
  wadaApricot: colors.etch,
  wadaOlive: colors.surface,
};

/**
 * Ikon medali ukiran: cincin ganda berarsir + glyph di tengah,
 * mengikuti hi-fi gaya engraving. Varian warna mengikuti
 * Sanzo Wada Dictionary of Color Combinations No. 211.
 */
export function MedallionIcon({ glyph, size = 44, variant = 'ink', style }: Props) {
  const glyphSize = Math.round(size * 0.38);
  return (
    <View style={[{ height: size, width: size }, style]}>
      <Image source={{ uri: RINGS[variant] }} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <AppIcon color={GLYPH_COLORS[variant]} name={glyph} size={glyphSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
