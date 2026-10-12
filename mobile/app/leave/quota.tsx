import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import {
  ANNUAL_LEAVE_QUOTA_PER_YEAR,
  IJIN_QUOTA_PER_YEAR,
} from '../../src/lib/businessRules';
import { colors, radius, spacing, typography } from '../../src/theme';

/**
 * Sisa kuota cuti tahunan & ijin.
 * Kuota berkurang hanya setelah pengajuan DISETUJUI (BR-16, BR-21).
 * Sakit tidak memotong kuota apa pun (BR-23).
 *
 * TODO (Fase 3): ambil dari leave_balances (per karyawan per tahun).
 */
export default function QuotaScreen() {
  // Contoh — ganti dengan data leave_balances.
  const cutiUsed = 4;
  const ijinUsed = 2.5; // 2 penuh + 1 setengah hari -> tetap hitung 3? Lihat catatan.
  void ijinUsed;

  const cutiLeft = ANNUAL_LEAVE_QUOTA_PER_YEAR - cutiUsed;
  const ijinLeft = IJIN_QUOTA_PER_YEAR - 3; // 2 penuh + 1 setengah hari (masing-masing potong 1)

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Sisa Kuota Tahun Ini</Text>

      <View style={styles.card}>
        <Text style={typography.subtitle}>Cuti Tahunan</Text>
        <Text style={styles.big}>
          {cutiLeft} <Text style={typography.caption}>/ {ANNUAL_LEAVE_QUOTA_PER_YEAR} hari</Text>
        </Text>
        <View style={styles.bar}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.info,
                width: `${(cutiLeft / ANNUAL_LEAVE_QUOTA_PER_YEAR) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={typography.caption}>
          Berkurang hanya setelah pengajuan disetujui PIC.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={typography.subtitle}>Ijin</Text>
        <Text style={styles.big}>
          {ijinLeft} <Text style={typography.caption}>/ {IJIN_QUOTA_PER_YEAR}</Text>
        </Text>
        <View style={styles.bar}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.warning,
                width: `${(ijinLeft / IJIN_QUOTA_PER_YEAR) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={typography.caption}>
          Ijin setengah hari memotong kuota 1 (sama seperti sehari penuh).
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={typography.subtitle}>Sakit</Text>
        <Text style={typography.body}>
          Tidak memotong kuota cuti maupun ijin. Wajib lampirkan surat dokter.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    height: 10,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  big: { fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  fill: { borderRadius: radius.pill, height: '100%' },
  heading: { marginBottom: spacing.md },
});
