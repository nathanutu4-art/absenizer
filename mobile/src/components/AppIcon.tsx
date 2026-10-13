import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { ICON_IMAGES, type IconName } from '../data/icons';
import { colors } from '../theme';

interface Props {
  /** Nama ikon gaya feather (stroke 2px). */
  name: IconName;
  size?: number;
  /** Warna via tintColor — sumber ikon selalu putih. */
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Ikon aplikasi: PNG garis-putih di atas transparan, diwarnai dengan
 * tintColor agar selaras dengan palet hi-fi (aktif #0057ba dsb).
 */
export function AppIcon({ name, size = 24, color = colors.ink, style }: Props) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={{ uri: ICON_IMAGES[name] }}
      style={[{ width: size, height: size, tintColor: color }, style]}
    />
  );
}
