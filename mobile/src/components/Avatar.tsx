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
   * kuning = ijin. Tanpa ring bila tidak diisi. Hanya untuk lingkaran.
   */
  statusRing?: 'sakit' | 'cuti' | 'ijin';
  /** 'circle' (default) atau 'square' ala bingkai foto. */
  shape?: 'circle' | 'square';
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

/** Avatar: lingkaran inisial di atas gradasi, atau bingkai foto persegi. */
export function Avatar({ name, size = 48, gradientId, statusRing, shape = 'circle' }: Props) {
  const radius = shape === 'circle' ? size / 2 : 0;
  const boxStyle = {
    width: size,
    height: size,
    borderRadius: radius,
  };
  const content = (
    <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
  );

  const body = gradientId ? (
    <ImageBackground
      imageStyle={{ borderRadius: radius }}
      resizeMode="stretch"
      source={AVATAR_GRADIENTS[gradientId]}
      style={[styles.box, boxStyle]}
    >
      {content}
    </ImageBackground>
  ) : (
    <View style={[styles.box, boxStyle, styles.fallback]}>{content}</View>
  );

  if (shape === 'square') {
    return (
      <View style={styles.frame}>
        <View style={[styles.frameInner, { width: size, height: size }]}>
          {body}
        </View>
      </View>
    );
  }

  if (!statusRing) return body;

  return (
    <View
      style={{
        borderColor: RING_COLORS[statusRing],
        borderRadius: size / 2 + 4,
        borderWidth: 3,
        padding: 2,
      }}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Bingkai foto persegi ganda, seperti bingkai gambar. */
  frame: {
    backgroundColor: colors.paper2,
    borderColor: colors.etch,
    borderWidth: 2,
    padding: 3,
  },
  frameInner: {
    borderColor: colors.etch,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fallback: { backgroundColor: colors.blueBg },
  text: { color: '#ffffff', fontFamily: fontFamily('800') },
});
