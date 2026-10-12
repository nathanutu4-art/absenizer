import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { HISTORY_ROWS, HISTORY_SUMMARY, type HistoryRow } from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

const STATUS_TONE: Record<HistoryRow['status'], 'green' | 'yellow' | 'blue' | 'red'> = {
  Hadir: 'green',
  Terlambat: 'yellow',
  Cuti: 'blue',
  Sakit: 'red',
  Ijin: 'yellow',
};

const SUMMARY_TONE: Record<string, 'green' | 'yellow' | 'blue' | 'red'> = {
  green: 'green',
  yellow: 'yellow',
  blue: 'blue',
  red: 'red',
};

/** Riwayat — ringkasan bulanan + baris kronologis. */
export default function HistoryScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.header}>Riwayat</Text>
      <Text style={styles.month}>Oktober 2026</Text>

      {/* Strip ringkasan */}
      <View style={styles.summary}>
        {HISTORY_SUMMARY.map((s) => (
          <View key={s.label} style={styles.cell}>
            <Text style={styles.cellValue}>{s.value}</Text>
            <Text style={styles.cellLabel}>{s.label}</Text>
            <View
              style={[
                styles.cellBar,
                { backgroundColor: toneColor(s.tone) },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Baris riwayat */}
      <View style={styles.list}>
        {HISTORY_ROWS.map((row) => (
          <View key={row.id} style={styles.item}>
            <View style={styles.dateBlock}>
              <Text style={styles.dayNum}>{row.dayNum}</Text>
              <Text style={styles.dateLabel}>{row.dateLabel}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.itemBody}>
              <View style={styles.itemTop}>
                <Text style={styles.itemTime}>
                  {row.clockIn} – {row.clockOut}
                </Text>
                <StatusChip label={row.status} tone={STATUS_TONE[row.status]} />
              </View>
              {row.flags.length > 0 ? (
                <View style={styles.flagRow}>
                  {row.flags.map((f) => (
                    <StatusChip key={f} label={f} tone="orange" style={styles.flagChip} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

function toneColor(tone: string): string {
  return SUMMARY_TONE[tone] === 'green'
    ? colors.green
    : SUMMARY_TONE[tone] === 'yellow'
      ? colors.yellowRing
      : SUMMARY_TONE[tone] === 'blue'
        ? colors.blue
        : colors.red;
}

const styles = StyleSheet.create({
  header: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 19,
    marginTop: spacing.sm,
  },
  month: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  cell: { alignItems: 'center', flex: 1 },
  cellValue: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 20 },
  cellLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 10.5,
    marginTop: 2,
  },
  cellBar: { borderRadius: 2, height: 3, marginTop: 6, width: 26 },
  list: { marginTop: spacing.md },
  item: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  dateBlock: { alignItems: 'center', width: 44 },
  dayNum: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 20 },
  dateLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 11 },
  divider: { backgroundColor: colors.line, height: '80%', marginHorizontal: 12, width: 1 },
  itemBody: { flex: 1 },
  itemTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTime: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  flagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  flagChip: { marginRight: 6 },
});
