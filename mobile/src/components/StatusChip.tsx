import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontFamily, radius } from '../theme';
import { FLAG_LABELS, type FlagType } from '../lib/businessRules';

interface Props {
  /** Jenis penanda absensi (BR-06/BR-09/BR-10/BR-18) atau status pengajuan. */
  flag?: FlagType;
  /** Label bebas bila bukan penanda absensi (mis. status pengajuan). */
  label?: string;
  tone?: 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

const TONE_COLORS = {
  green: { bg: colors.greenBg, fg: colors.green },
  red: { bg: colors.redBg, fg: colors.red },
  blue: { bg: colors.blueBg, fg: colors.blue },
  yellow: { bg: colors.yellowBg, fg: colors.yellowText },
  orange: { bg: colors.orangeBg, fg: colors.orange },
  neutral: { bg: colors.line, fg: colors.ink2 },
} as const;

const FLAG_TONES: Record<FlagType, keyof typeof TONE_COLORS> = {
  di_luar_area: 'orange',
  wajah_tidak_cocok: 'yellow',
  fake_gps: 'red',
  terlambat: 'yellow',
  tidak_lengkap: 'neutral',
};

/** Chip kecil untuk penanda absensi / status — teks Bahasa Indonesia. */
export function StatusChip({ flag, label, tone, style }: Props) {
  const text = flag ? FLAG_LABELS[flag] : (label ?? '');
  const resolvedTone = tone ?? (flag ? FLAG_TONES[flag] : 'neutral');
  const c = TONE_COLORS[resolvedTone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontFamily: fontFamily('700'), fontSize: 11 },
});
