import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../theme';

import { GRADIENT_IMAGES } from '../data/gradientImages';

/**
 * Gradasi avatar dua-stop sebagai data-URI (tanpa file biner).
 * Dibangkitkan dari pasangan warna spek desain (lihat src/data/demo.ts).
 */
const AVATAR_GRADIENTS = {
  '01': { uri: GRADIENT_IMAGES.avatar_01 },
  '02': { uri: GRADIENT_IMAGES.avatar_02 },
  '03': { uri: GRADIENT_IMAGES.avatar_03 },
  '04': { uri: GRADIENT_IMAGES.avatar_04 },
  '05': { uri: GRADIENT_IMAGES.avatar_05 },
  '06': { uri: GRADIENT_IMAGES.avatar_06 },
  '07': { uri: GRADIENT_IMAGES.avatar_07 },
  '08': { uri: GRADIENT_IMAGES.avatar_08 },
  '09': { uri: GRADIENT_IMAGES.avatar_09 },
  '10': { uri: GRADIENT_IMAGES.avatar_10 },
  '11': { uri: GRADIENT_IMAGES.avatar_11 },
  '12': { uri: GRADIENT_IMAGES.avatar_12 },
} as const;

export type AvatarGradientId = keyof typeof AVATAR_GRADIENTS;

interface Props {
  /** Nama lengkap — diambil inisialnya. */
  name: string;
  size?: number;
  /** Id gradasi avatar (01–12) dari dataset demo. */
  gradientId?: AvatarGradientId;
  /**
   * Warna ring status (halaman Tim): merah = sakit, biru = cuti,
   * kuning = ijin. Tanpa ring bila tidak diisi.
   */
  statusRing?: 'sakit' | 'cuti' | 'ijin';
}

const RING_COLORS = {
  sakit: colors.red,
  cuti: colors.blue,
  ijin: colors.yellowRing,
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Avatar lingkaran: inisial di atas gradasi dua-stop + opsional ring status. */
export function Avatar({ name, size = 48, gradientId, statusRing }: Props) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const content = (
    <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
  );

  const circle = gradientId ? (
    <ImageBackground
      imageStyle={{ borderRadius: size / 2 }}
      resizeMode="stretch"
      source={AVATAR_GRADIENTS[gradientId]}
      style={[styles.circle, circleStyle]}
    >
      {content}
    </ImageBackground>
  ) : (
    <View style={[styles.circle, circleStyle, styles.fallback]}>{content}</View>
  );

  if (!statusRing) return circle;

  return (
    <View
      style={{
        borderColor: RING_COLORS[statusRing],
        borderRadius: size / 2 + 4,
        borderWidth: 3,
        padding: 2,
      }}
    >
      {circle}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: { backgroundColor: colors.blueBg },
  text: { color: '#ffffff', fontFamily: fontFamily('800') },
});
