import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MEDALLION_CREAM, MEDALLION_INK } from '../data/medallions';
import { AppIcon } from './AppIcon';
import type { IconName } from '../data/icons';
import { colors } from '../theme';

interface Props {
  /** Nama glyph (feather-style). */
  glyph: IconName;
  /** Diameter medali. */
  size?: number;
  /** 'ink' untuk latar terang, 'cream' untuk latar gelap. */
  variant?: 'ink' | 'cream';
  style?: StyleProp<ViewStyle>;
}

/**
 * Ikon medali ukiran: cincin ganda berarsir + glyph di tengah,
 * mengikuti hi-fi gaya engraving.
 */
export function MedallionIcon({ glyph, size = 44, variant = 'ink', style }: Props) {
  const ring = variant === 'ink' ? MEDALLION_INK : MEDALLION_CREAM;
  const glyphColor = variant === 'ink' ? colors.etch : colors.surface;
  const glyphSize = Math.round(size * 0.38);
  return (
    <View style={[{ height: size, width: size }, style]}>
      <Image source={{ uri: ring }} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <AppIcon color={glyphColor} name={glyph} size={glyphSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
