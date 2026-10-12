import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import { getEmployee } from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

const ROLE_EMPLOYEE: Record<DemoRole, string> = {
  karyawan: 'nadia',
  pic: 'dimas',
  hr: 'sari',
};

/**
 * Sukses Clock In — struk dengan baris putus-putus + daftar penanda.
 */
export default function SuccessScreen() {
  const { time, distance, simFace, simFar } = useLocalSearchParams<{
    time?: string;
    distance?: string;
    simFace?: string;
    simFar?: string;
  }>();
  const [name, setName] = useState('—');

  useEffect(() => {
    getActiveRole().then((role) => setName(getEmployee(ROLE_EMPLOYEE[role]).name));
  }, []);

  const flags: string[] = [];
  if (simFace) flags.push('Wajah Tidak Cocok');
  if (simFar) flags.push('Di Luar Area');
  const clean = flags.length === 0;

  const rows: [string, string][] = [
    ['Nama', name],
    ['Mode Kerja', 'WFO'],
    ['Jarak', distance ?? '120 m'],
    [
      'Verifikasi Wajah',
      simFace ? 'Tidak cocok — diberi penanda' : 'Cocok (96%)',
    ],
    ['Status', clean ? 'Tercatat' : 'Tercatat dengan penanda'],
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.checkWrap}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkGlyph}>✓</Text>
          </View>
        </View>
        <Text style={styles.title}>Clock In Berhasil</Text>
        <Text style={styles.timestamp}>
          {time ?? '--.--'} WIB • {todayLong()}
        </Text>

        <View style={styles.flagRow}>
          {clean ? (
            <StatusChip label="Tanpa Penanda" tone="green" />
          ) : (
            flags.map((f) => (
              <StatusChip key={f} label={f} tone="orange" style={styles.flagChip} />
            ))
          )}
        </View>

        {/* Struk */}
        <View style={styles.receipt}>
          {rows.map(([label, value], i) => (
            <View key={label}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text
                  style={[
                    styles.rowValue,
                    label === 'Verifikasi Wajah' && simFace && styles.rowWarn,
                  ]}
                >
                  {value}
                </Text>
              </View>
              {i < rows.length - 1 ? <View style={styles.dashed} /> : null}
            </View>
          ))}
        </View>

        <View style={styles.ctaWrap}>
          <ThemedButton
            onPress={() => router.replace('/(tabs)/home')}
            title="Kembali ke Beranda"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function todayLong(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  safe: { flex: 1, padding: spacing.lg },
  checkWrap: { alignItems: 'center', marginTop: spacing.xl },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  checkGlyph: { color: '#fff', fontSize: 48, fontWeight: '800', marginTop: -4 },
  title: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 22,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  timestamp: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  flagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  flagChip: { marginHorizontal: 4 },
  receipt: {
    backgroundColor: '#fff',
    borderRadius: 17,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: { color: colors.ink2, fontFamily: fontFamily('500'), fontSize: 13 },
  rowValue: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 13,
    textAlign: 'right',
  },
  rowWarn: { color: colors.orange },
  dashed: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  ctaWrap: { marginTop: spacing.xl },
});
