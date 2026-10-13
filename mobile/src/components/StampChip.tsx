import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { fontFamily, radius } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Warna cap (teks + border). */
  color: string;
  /** Warna latar (default transparan). */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Chip cap stempel: uppercase, letter-spacing, border 1.5px,
 * radius 2px, dimiringkan -0.6° seperti cap.
 */
export function StampChip({ children, color, backgroundColor = 'transparent', style }: Props) {
  return (
    <View style={[styles.chip, { borderColor: color, backgroundColor }, style]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    transform: [{ rotate: '-0.6deg' }],
  },
  text: {
    fontFamily: fontFamily('700'),
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
