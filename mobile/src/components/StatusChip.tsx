import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { FLAG_LABELS, type FlagType } from '../lib/businessRules';

interface Props {
  /** Jenis penanda absensi (BR-06/BR-09/BR-10/BR-18) atau status pengajuan. */
  flag?: FlagType;
  /** Label bebas bila bukan penanda absensi (mis. status pengajuan). */
  label?: string;
  tone?: 'danger' | 'info' | 'warning' | 'success' | 'neutral';
}

const TONE_COLORS = {
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.infoSoft, fg: colors.info },
  warning: { bg: colors.warningSoft, fg: '#8a6100' },
  success: { bg: colors.successSoft, fg: colors.success },
  neutral: { bg: colors.line, fg: colors.inkSoft },
} as const;

const FLAG_TONES: Record<FlagType, keyof typeof TONE_COLORS> = {
  di_luar_area: 'warning',
  wajah_tidak_cocok: 'warning',
  fake_gps: 'danger',
  terlambat: 'warning',
  tidak_lengkap: 'neutral',
};

/** Chip kecil untuk penanda absensi / status — teks Bahasa Indonesia. */
export function StatusChip({ flag, label, tone }: Props) {
  const text = flag ? FLAG_LABELS[flag] : (label ?? '');
  const resolvedTone = tone ?? (flag ? FLAG_TONES[flag] : 'neutral');
  const c = TONE_COLORS[resolvedTone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
