import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  /** Nama lengkap — diambil inisialnya. */
  name: string;
  size?: number;
  /**
   * Warna border status (halaman Tim): merah = sakit, biru = cuti,
   * kuning = ijin. Tanpa border bila tidak diisi.
   */
  statusBorder?: 'sakit' | 'cuti' | 'ijin';
}

const BORDER_COLORS = {
  sakit: colors.danger,
  cuti: colors.info,
  ijin: colors.warning,
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Avatar lingkaran berisi inisial, opsional border warna status. */
export function Avatar({ name, size = 48, statusBorder }: Props) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: statusBorder ? 3 : 0,
          borderColor: statusBorder ? BORDER_COLORS[statusBorder] : 'transparent',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
  },
  text: {
    color: colors.primary,
    fontWeight: '800',
  },
});

// Radius sudut standar diekspor ulang untuk konsistensi impor komponen.
export { radius };
