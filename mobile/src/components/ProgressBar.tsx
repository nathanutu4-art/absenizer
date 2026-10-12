import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  /** 0..1 */
  progress: number;
  barColor?: string;
  height?: number;
}

/** Bilah progres (mis. sisa kuota cuti/ijin). */
export function ProgressBar({
  progress,
  barColor = colors.indigo,
  height = 8,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: barColor,
            borderRadius: height / 2,
            height,
            width: `${clamped * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.line, overflow: 'hidden', width: '100%' },
  fill: {},
});

export { radius };
