import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../src/components/AppIcon';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { StampChip } from '../../src/components/StampChip';
import { getEmployee } from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { getMyEmployee } from '../../src/lib/db';
import { getSelfiePhoto } from '../../src/lib/selfiePhoto';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const ROLE_EMPLOYEE: Record<DemoRole, string> = {
  karyawan: 'nadia',
  pic: 'dimas',
  hr: 'sari',
};

/**
 * Sukses Clock In/Out — struk dengan baris putus-putus + daftar penanda.
 */
export default function SuccessScreen() {
  const { time, distance, simFar, kind } = useLocalSearchParams<{
    time?: string;
    distance?: string;
    simFar?: string;
    kind?: string;
  }>();
  const isOut = kind === 'out';
  const [name, setName] = useState('—');
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Nama pengguna yang login (data real); fallback ke demo bila sesi demo.
      const me = await getMyEmployee();
      if (me) {
        setName(me.name);
      } else {
        const role = await getActiveRole();
        setName(getEmployee(ROLE_EMPLOYEE[role]).name);
      }
    })();
    setPhoto(getSelfiePhoto());
  }, []);

  const flags: string[] = [];
  if (simFar) flags.push('Di Luar Area');
  const clean = flags.length === 0;

  const rows: [string, string][] = [
    ['Nama', name],
    ['Mode Kerja', 'WFO'],
    ['Jarak', distance ?? '120 m'],
    ['Status', clean ? 'Tercatat' : 'Tercatat dengan penanda'],
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.checkWrap}>
          <View style={styles.checkPlate}>
            <View style={styles.checkShadow} />
            <View style={styles.checkCircle}>
              <AppIcon color="#ffffff" name="check" size={56} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>{isOut ? 'Clock Out Berhasil' : 'Clock In Berhasil'}</Text>
        {photo && (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photo }} style={styles.photo} />
          </View>
        )}
        <Text style={styles.timestamp}>
          {time ?? '--.--'} WIB • {todayLong()}
        </Text>

        <View style={styles.flagRow}>
          {clean ? (
            <StampChip color={colors.green} backgroundColor={colors.greenBg}>
              Tanpa Penanda
            </StampChip>
          ) : (
            flags.map((f) => (
              <StampChip
                key={f}
                color={colors.orange}
                backgroundColor={colors.orangeBg}
                style={styles.flagChip}
              >
                {f}
              </StampChip>
            ))
          )}
        </View>

        {/* Struk */}
        <Plate style={styles.receiptPlate}>
          <View style={styles.receiptInner}>
            {rows.map(([label, value], i) => (
              <View key={label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowValue}>{value}</Text>
                </View>
                {i < rows.length - 1 ? <View style={styles.dashed} /> : null}
              </View>
            ))}
          </View>
        </Plate>

        <View style={styles.ctaWrap}>
          <PlateButton onPress={() => router.replace('/(tabs)/home')} variant="paper">
            Kembali ke Beranda
          </PlateButton>
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

const CHECK_SIZE = 112;

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  safe: { flex: 1, padding: spacing.lg },
  checkWrap: { alignItems: 'center', marginTop: spacing.xl },
  checkPlate: {
    height: CHECK_SIZE,
    position: 'relative',
    width: CHECK_SIZE,
  },
  checkShadow: {
    backgroundColor: colors.etchDeep,
    borderRadius: CHECK_SIZE / 2,
    height: CHECK_SIZE,
    left: 4,
    position: 'absolute',
    top: 4,
    width: CHECK_SIZE,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderColor: colors.etch,
    borderRadius: CHECK_SIZE / 2,
    borderWidth: 1.5,
    height: CHECK_SIZE,
    justifyContent: 'center',
    width: CHECK_SIZE,
  },
  title: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
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
  photoWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  photo: {
    borderColor: colors.etch,
    borderWidth: 2,
    height: 120,
    width: 120,
  },
  flagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  flagChip: { marginHorizontal: 4 },
  receiptPlate: { marginTop: spacing.lg },
  receiptInner: { padding: spacing.lg },
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
  dashed: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  ctaWrap: { marginTop: spacing.xl },
});
