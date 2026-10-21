import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AttendanceDetailModal } from '../../src/components/AttendanceDetailModal';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { Skeleton } from '../../src/components/Skeleton';
import { StampChip } from '../../src/components/StampChip';
import { HISTORY_ROWS, type HistoryRow } from '../../src/data/demo';
import { getMyAttendance } from '../../src/lib/db';
import { calcDuration } from '../../src/lib/duration';
import { getSession } from '../../src/lib/session';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_TONE: Record<HistoryRow['status'], 'green' | 'yellow' | 'blue' | 'red'> = {
  Hadir: 'green',
  Terlambat: 'yellow',
  Cuti: 'blue',
  Sakit: 'red',
  Ijin: 'yellow',
};

const STAMP_COLORS = {
  green: { color: colors.green, bg: colors.greenBg },
  yellow: { color: colors.yellowText, bg: colors.yellowBg },
  blue: { color: colors.blue, bg: colors.blueBg },
  red: { color: colors.red, bg: colors.redBg },
  orange: { color: colors.orange, bg: colors.orangeBg },
} as const;

/** Riwayat — ringkasan + baris kronologis milik pengguna yang login. */
export default function HistoryScreen() {
  // Sesi real: data asli dari Supabase (kosong bila tak ada) — tanpa
  // fallback demo. Sesi demo: tampilkan baris demo.
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Baris yang dibuka di popup detail; null = popup tertutup.
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const session = await getSession();
      if (session?.demo !== false) {
        if (alive) {
          setRows(HISTORY_ROWS);
          setLoading(false);
        }
        return;
      }
      const list = await getMyAttendance();
      if (alive) {
        setRows(list);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const summary = useMemo(() => {
    const counts: Record<HistoryRow['status'], number> = {
      Hadir: 0,
      Terlambat: 0,
      Cuti: 0,
      Sakit: 0,
      Ijin: 0,
    };
    for (const r of rows) counts[r.status] += 1;
    return [
      { label: 'Hadir', value: counts.Hadir, tone: 'green' },
      { label: 'Terlambat', value: counts.Terlambat, tone: 'yellow' },
      { label: 'Cuti', value: counts.Cuti, tone: 'blue' },
      { label: 'Sakit', value: counts.Sakit, tone: 'red' },
      { label: 'Ijin', value: counts.Ijin, tone: 'yellow' },
    ];
  }, [rows]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  return (
    <View style={styles.root}>
      {/* Background: putih dengan sentuhan gradient lembut */}
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
      <SafeAreaView edges={['top']}>
      {/* Tajuk arsip */}
      <View style={styles.headerRow}>
        <MedallionIcon glyph="clock" size={58} variant="wadaIndigo" />
        <View style={styles.headerText}>
          <Text style={styles.header}>Riwayat</Text>
          <Text style={styles.month}>{monthLabel}</Text>
        </View>
        <StampChip color={colors.ink} backgroundColor={colors.paper2}>
          {`${rows.length} hari`}
        </StampChip>
      </View>
      <View style={styles.doubleRule}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
      </View>

      {/* Strip ringkasan */}
      <View style={styles.summary}>
        {summary.map((s) => (
          <Plate solidColor="rgba(2,85,179,0.85)" key={s.label} style={styles.cell}>
            <View style={styles.cellInner}>
              <Text style={[styles.cellValue, styles.onBlueText]}>{s.value}</Text>
              <Text style={[styles.cellLabel, styles.onBlueSubtext]}>{s.label}</Text>
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
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Plate solidColor="rgba(2,85,179,0.85)" key={i} style={styles.itemWrap}>
                <View style={styles.item}>
                  <View style={styles.dateBlock}>
                    <Skeleton width={30} height={24} />
                    <Skeleton width={30} height={12} style={styles.rowSkeletonGap} />
                  </View>
                  <View style={[styles.divider, styles.onBlueDividerBorder]} />
                  <View style={styles.itemBody}>
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="45%" height={12} style={styles.rowSkeletonGap} />
                  </View>
                </View>
              </Plate>
            ))}
          </>
        ) : rows.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada riwayat kehadiran.</Text>
        ) : (
          rows.map((row) => {
          const stamp = STAMP_COLORS[STATUS_TONE[row.status]];
          const duration = calcDuration(row.clockIn, row.clockOut);
          return (
            <Plate solidColor="rgba(2,85,179,0.85)" key={row.id} style={styles.itemWrap}>
              <TouchableOpacity
                accessibilityLabel={`Detail kehadiran ${row.dayNum} ${row.monthYear}`}
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => setSelectedRow(row)}
              >
              <View style={styles.item}>
                <View style={styles.dateBlock}>
                  <Text style={[styles.dayNum, styles.onBlueText]}>{row.dayNum}</Text>
                  <Text style={[styles.dateLabel, styles.onBlueTertiary]}>{row.dateLabel}</Text>
                </View>
                <View style={[styles.divider, styles.onBlueDividerBorder]} />
                <View style={styles.itemBody}>
                  <View style={styles.itemTop}>
                    <Text style={[styles.itemTime, styles.onBlueText]}>
                      {row.clockIn} – {row.clockOut}
                    </Text>
                    <StampChip color={stamp.color} backgroundColor={stamp.bg}>
                      {row.status}
                    </StampChip>
                  </View>
                  <Text style={[styles.durationText, styles.onBlueTertiary]}>
                    Masuk {row.clockIn} • Pulang {row.clockOut} • Durasi {duration}
                  </Text>
                  {row.flags.length > 0 ? (
                    <View style={styles.flagRow}>
                      {row.flags.map((f, fi) => (
                        <StampChip
                          key={`${f}-${fi}`}
                          color={STAMP_COLORS.orange.color}
                          backgroundColor={STAMP_COLORS.orange.bg}
                          style={styles.flagChip}
                        >
                          {f}
                        </StampChip>
                      ))}
                    </View>
                  ) : null}
                  <Text style={[styles.detailLink, styles.onBlueText]}>Lihat detail →</Text>
                </View>
              </View>
              </TouchableOpacity>
            </Plate>
          );
          })
        )}
      </View>

      <AttendanceDetailModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
      </SafeAreaView>
      </ScrollView>
    </View>
  );
}

/** Petakan nama tone ringkasan ke warna tema yang sesuai. */
function toneColor(tone: string): string {
  return tone === 'green'
    ? colors.green
    : tone === 'yellow'
      ? colors.yellowRing
      : tone === 'blue'
        ? colors.blue
        : colors.red;
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 130 },
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
  emptyText: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 13.5,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
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
  durationText: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: 4,
  },
  rowSkeletonGap: { marginTop: 6 },
  /* Override teks untuk kartu biru */
  onBlueText: { color: '#ffffff' },
  onBlueSubtext: { color: 'rgba(255,255,255,0.75)' },
  onBlueTertiary: { color: 'rgba(255,255,255,0.6)' },
  onBlueDividerBorder: { borderColor: 'rgba(255,255,255,0.25)' },
  flagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  flagChip: { marginRight: 6, marginTop: 4 },
  detailLink: {
    color: colors.wadaApricot,
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginTop: 8,
  },
});
