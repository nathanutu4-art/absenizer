import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { FLAG_LABELS, type FlagType } from '../../src/lib/businessRules';
import { supabase } from '../../src/lib/supabase';
import { colors, radius, spacing, typography } from '../../src/theme';

interface HistoryRow {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  flags: FlagType[];
}

/**
 * Riwayat kehadiran karyawan.
 * TODO (Fase 1): ganti data contoh dengan query ke tabel attendance +
 * attendance_flags milik pengguna yang masuk, urut tanggal menurun.
 */
const SAMPLE: HistoryRow[] = [
  {
    id: '1',
    date: 'Senin, 12 Okt 2026',
    clockIn: '08:05',
    clockOut: '17:02',
    flags: [],
  },
  {
    id: '2',
    date: 'Jumat, 9 Okt 2026',
    clockIn: '08:22',
    clockOut: '17:00',
    flags: ['terlambat'],
  },
];

export default function HistoryScreen() {
  const [rows, setRows] = useState<HistoryRow[]>(SAMPLE);

  useEffect(() => {
    (async () => {
      // TODO: const { data } = await supabase.from('attendance')...
      void supabase;
      setRows(SAMPLE);
    })();
  }, []);

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Riwayat Kehadiran</Text>
      {rows.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={typography.subtitle}>{r.date}</Text>
          <Text style={typography.body}>
            Masuk: {r.clockIn ?? '-'} • Pulang: {r.clockOut ?? '-'}
          </Text>
          <View style={styles.flags}>
            {r.flags.length === 0 ? (
              <StatusChip label="Tepat Waktu" tone="success" />
            ) : (
              r.flags.map((f) => <StatusChip key={f} flag={f} />)
            )}
          </View>
          <Text style={typography.caption}>
            Penanda: {r.flags.map((f) => FLAG_LABELS[f]).join(', ') || 'tidak ada'}
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  flags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  heading: { marginBottom: spacing.md },
});
