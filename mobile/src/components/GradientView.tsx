import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { GRADIENT_IMAGES } from '../data/gradientImages';

const GRADIENTS = {
  primary: { uri: GRADIENT_IMAGES.grad_primary },
  hero: { uri: GRADIENT_IMAGES.grad_hero },
  clockOut: { uri: GRADIENT_IMAGES.grad_clockout },
} as const;

export type GradientKind = keyof typeof GRADIENTS;

interface Props {
  kind: GradientKind;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

/**
 * Gradasi tanpa dependensi native: PNG kecil di-stretch sebagai latar.
 * Dipakai untuk tombol primer, hero, dan tombol clock-out sesuai spek desain.
 */
export function GradientView({ kind, children, style, imageStyle }: Props) {
  const source: ImageSourcePropType = GRADIENTS[kind];
  return (
    <ImageBackground
      resizeMode="stretch"
      source={source}
      style={[styles.fill, style]}
      imageStyle={imageStyle}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { overflow: 'hidden' },
});
