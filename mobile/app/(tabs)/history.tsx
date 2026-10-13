import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StampChip } from '../../src/components/StampChip';
import { HISTORY_ROWS, HISTORY_SUMMARY, type HistoryRow } from '../../src/data/demo';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

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

const STAMP_COLORS = {
  green: { color: colors.green, bg: colors.greenBg },
  yellow: { color: colors.yellowText, bg: colors.yellowBg },
  blue: { color: colors.blue, bg: colors.blueBg },
  red: { color: colors.red, bg: colors.redBg },
  orange: { color: colors.orange, bg: colors.orangeBg },
} as const;

/** Riwayat — ringkasan bulanan + baris kronologis. */
export default function HistoryScreen() {
  return (
    <ScreenContainer>
      {/* Tajuk arsip */}
      <View style={styles.headerRow}>
        <MedallionIcon glyph="clock" size={58} />
        <View style={styles.headerText}>
          <Text style={styles.header}>Riwayat</Text>
          <Text style={styles.month}>Oktober 2026</Text>
        </View>
        <StampChip color={colors.ink} backgroundColor={colors.paper2}>
          {`${HISTORY_ROWS.length} hari`}
        </StampChip>
      </View>
      <View style={styles.doubleRule}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
      </View>

      {/* Strip ringkasan */}
      <View style={styles.summary}>
        {HISTORY_SUMMARY.map((s) => (
          <Plate key={s.label} style={styles.cell}>
            <View style={styles.cellInner}>
              <Text style={styles.cellValue}>{s.value}</Text>
              <Text style={styles.cellLabel}>{s.label}</Text>
              <View
                style={[
                  styles.cellBar,
                  { backgroundColor: toneColor(s.tone) },
                ]}
              />
            </View>
          </Plate>
        ))}
      </View>

      {/* Baris riwayat */}
      <View style={styles.list}>
        {HISTORY_ROWS.map((row) => {
          const stamp = STAMP_COLORS[STATUS_TONE[row.status]];
          return (
            <Plate key={row.id} style={styles.itemWrap}>
              <View style={styles.item}>
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
                    <StampChip color={stamp.color} backgroundColor={stamp.bg}>
                      {row.status}
                    </StampChip>
                  </View>
                  {row.flags.length > 0 ? (
                    <View style={styles.flagRow}>
                      {row.flags.map((f) => (
                        <StampChip
                          key={f}
                          color={STAMP_COLORS.orange.color}
                          backgroundColor={STAMP_COLORS.orange.bg}
                          style={styles.flagChip}
                        >
                          {f}
                        </StampChip>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </Plate>
          );
        })}
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  headerText: { flex: 1, marginLeft: 12 },
  header: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 22,
  },
  month: {
    color: colors.ink2,
    fontFamily: serifFamily('800'),
    fontSize: 14,
    marginTop: 2,
  },
  doubleRule: { marginTop: spacing.md },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  summary: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cell: { flex: 1 },
  cellInner: { alignItems: 'center', paddingVertical: 12 },
  cellValue: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 20,
  },
  cellLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 10.5,
    marginTop: 2,
  },
  cellBar: { borderRadius: 2, height: 3, marginTop: 8, width: 26 },
  list: { marginTop: spacing.md },
  itemWrap: { marginBottom: spacing.sm },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  dateBlock: { alignItems: 'center', width: 44 },
  dayNum: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 22 },
  dateLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 11 },
  divider: {
    alignSelf: 'stretch',
    borderColor: colors.line,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    marginHorizontal: 12,
  },
  itemBody: { flex: 1 },
  itemTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTime: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  flagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  flagChip: { marginRight: 6, marginTop: 4 },
});
