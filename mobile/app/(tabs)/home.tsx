import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../../src/components/GradientView';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { StampChip } from '../../src/components/StampChip';
import { showToast } from '../../src/components/Toast';
import type { IconName } from '../../src/data/icons';
import { HATCH_TILE, SUNBURST_INK } from '../../src/data/medallions';
import {
  GEOFENCE_M,
  LATE_TOLERANCE_MIN,
  OFFICE_NAME,
  PIC_REQUESTS,
  QUOTAS,
  WORK_END,
  WORK_START,
  getEmployee,
} from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { recordClockOut, useClockState } from '../../src/lib/clockState';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

function useWibClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(now);
}

function todayLine(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

function nowShort(): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
    .format(new Date())
    .replace(':', '.');
}

const ROLE_EMPLOYEE: Record<DemoRole, string> = {
  karyawan: 'nadia',
  pic: 'dimas',
  hr: 'sari',
};

const ROLE_LABEL: Record<DemoRole, string> = {
  karyawan: 'Karyawan',
  pic: 'PIC',
  hr: 'HR',
};

/** Judul seksi ukiran: serif + garis ganda (3px, jeda 3px, 1px). */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{children}</Text>
      <View style={styles.doubleRule}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleGap} />
        <View style={styles.ruleThin} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [role, setRole] = useState<DemoRole>('karyawan');
  const clock = useClockState();
  const wib = useWibClock();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const me = getEmployee(ROLE_EMPLOYEE[role]);
  const pendingCount = PIC_REQUESTS.filter((r) => r.status === 'menunggu').length;
  const escalatedCount = PIC_REQUESTS.filter(
    (r) => r.status === 'menunggu' && r.escalated,
  ).length;

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  function handleClockPress() {
    if (clock.phase === 'in') {
      router.push('/clock-in/selfie');
    } else if (clock.phase === 'out') {
      recordClockOut(nowShort());
      showToast('Clock out tercatat. Sampai jumpa!');
    } else {
      showToast('Absensi hari ini sudah lengkap.');
    }
  }

  const clockLabel =
    clock.phase === 'in' ? 'Clock In' : clock.phase === 'out' ? 'Clock Out' : 'Selesai';
  const statusChip =
    clock.phase === 'in' ? 'Belum Clock In' : clock.phase === 'out' ? 'Sudah Clock In' : 'Selesai';

  const shortcuts: { label: string; icon: IconName; route: string }[] =
    role === 'karyawan'
      ? [
          { label: 'Pengajuan', icon: 'file_text', route: '/(tabs)/requests' },
          { label: 'Tim', icon: 'users', route: '/(tabs)/team' },
          { label: 'Riwayat', icon: 'clock', route: '/(tabs)/history' },
          { label: 'Profil', icon: 'user', route: '/(tabs)/profile' },
        ]
      : role === 'pic'
        ? [
            { label: 'Persetujuan', icon: 'check_circle', route: '/(tabs)/approvals' },
            { label: 'Tim', icon: 'users', route: '/(tabs)/team' },
            { label: 'Profil', icon: 'user', route: '/(tabs)/profile' },
          ]
        : [
            { label: 'Ambil Alih', icon: 'repeat', route: '/(tabs)/takeover' },
            { label: 'Tim', icon: 'users', route: '/(tabs)/team' },
            { label: 'Profil', icon: 'user', route: '/(tabs)/profile' },
          ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HERO */}
        <GradientView kind="hero" style={styles.hero}>
          <Image
            source={{ uri: HATCH_TILE }}
            resizeMode="repeat"
            style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}
          />
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <View style={styles.greetingRow}>
                <MedallionIcon glyph="user" size={52} variant="cream" />
                <View style={styles.greetingText}>
                  <Text style={styles.greetingSmall}>
                    Selamat datang, {ROLE_LABEL[role]}
                  </Text>
                  <Text style={styles.greetingName}>{me.name}</Text>
                  <Text style={styles.dateLine}>{todayLine()}</Text>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => showToast('Belum ada notifikasi baru.')}
                style={styles.bell}
              >
                <MedallionIcon glyph="bell" size={44} variant="cream" />
                <View style={styles.bellDot} />
              </TouchableOpacity>
            </View>

            {/* Kartu status */}
            <Plate style={styles.statusPlate}>
              <View style={styles.statusInner}>
                <StampChip
                  backgroundColor={clock.phase === 'in' ? colors.paper2 : colors.greenBg}
                  color={clock.phase === 'in' ? colors.ink2 : colors.green}
                >
                  {statusChip}
                </StampChip>
                <View style={styles.timeCols}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeValue}>{clock.inTime ?? '--.--'}</Text>
                    <Text style={styles.timeLabel}>Jam Masuk</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeCol}>
                    <Text style={styles.timeValue}>{clock.outTime ?? '--.--'}</Text>
                    <Text style={styles.timeLabel}>Jam Pulang</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeCol}>
                    <Text style={styles.timeValue}>
                      {clock.inTime && clock.outTime ? '8j 03m' : '--'}
                    </Text>
                    <Text style={styles.timeLabel}>Durasi</Text>
                  </View>
                </View>
              </View>
            </Plate>
          </SafeAreaView>
        </GradientView>

        {/* MEDALI CLOCK */}
        <View style={styles.clockWrap}>
          <View style={styles.clockCenter}>
            <Animated.View
              style={[
                styles.pulseRing,
                { opacity: clock.phase === 'done' ? 0 : ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <View style={styles.clockShadow} />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={handleClockPress}
              style={[
                styles.clockPlate,
                clock.phase === 'out' && styles.clockPlateOut,
                clock.phase === 'done' && styles.clockDimmed,
              ]}
            >
              <Image
                source={{ uri: SUNBURST_INK }}
                resizeMode="contain"
                style={styles.sunburst}
              />
              <MedallionIcon glyph="clock" size={112} variant="ink" />
              <Text style={styles.clockLabel}>{clockLabel}</Text>
              <Text style={styles.clockTime}>{wib} WIB</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.clockHint}>
            {clock.phase === 'in'
              ? 'Ketuk untuk mulai absensi hari ini'
              : clock.phase === 'out'
                ? 'Ketuk untuk menyelesaikan absensi'
                : 'Terima kasih, absensi hari ini lengkap'}
          </Text>
        </View>

        {/* JAM KERJA */}
        <Plate style={styles.hoursPlate}>
          <View style={styles.hoursInner}>
            <View style={styles.hoursRow}>
              <MedallionIcon glyph="clock" size={40} variant="ink" />
              <Text style={styles.hoursText}>
                {WORK_START}–{WORK_END} • toleransi {LATE_TOLERANCE_MIN} mnt
              </Text>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursRow}>
              <MedallionIcon glyph="map_pin" size={40} variant="ink" />
              <Text style={styles.hoursText}>
                WFO {OFFICE_NAME} • geofence {GEOFENCE_M.toLocaleString('id-ID')} m
              </Text>
            </View>
          </View>
        </Plate>

        {/* SHORTCUT */}
        <View style={styles.shortcutGrid}>
          {shortcuts.map((s) => (
            <TouchableOpacity
              accessibilityRole="button"
              key={s.label}
              onPress={() => router.push(s.route as never)}
              style={styles.shortcutTouch}
            >
              <Plate style={styles.shortcutPlate}>
                <View style={styles.shortcutInner}>
                  <MedallionIcon glyph={s.icon} size={44} variant="ink" />
                  <Text style={styles.shortcutLabel}>{s.label}</Text>
                </View>
              </Plate>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEKSI PERAN */}
        {role === 'karyawan' ? (
          <Plate style={styles.sectionPlate}>
            <View style={styles.sectionInner}>
              <SectionTitle>Sisa Kuota</SectionTitle>
              {QUOTAS.slice(0, 2).map((q) => (
                <View key={q.type} style={styles.quotaRow}>
                  <Text style={styles.quotaLabel}>
                    {q.type === 'cuti' ? 'Cuti' : 'Ijin'}
                  </Text>
                  <Text style={styles.quotaValue}>
                    {q.total !== null ? `${q.total - q.used} dari ${q.total} tersisa` : 'Tanpa batas'}
                  </Text>
                </View>
              ))}
              <TouchableOpacity onPress={() => router.push('/(tabs)/requests')}>
                <Text style={styles.linkText}>Lihat semua kuota →</Text>
              </TouchableOpacity>
            </View>
          </Plate>
        ) : null}
        {role === 'pic' ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/approvals')}
            style={styles.sectionTouch}
          >
            <Plate style={styles.sectionPlateTight}>
              <View style={styles.sectionInner}>
                <SectionTitle>Menunggu Persetujuan</SectionTitle>
                <Text style={styles.roleBig}>{pendingCount} pengajuan</Text>
                <Text style={styles.linkText}>Tinjau sekarang →</Text>
              </View>
            </Plate>
          </TouchableOpacity>
        ) : null}
        {role === 'hr' ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/takeover')}
            style={styles.sectionTouch}
          >
            <Plate style={styles.sectionPlateTight}>
              <View style={styles.sectionInner}>
                <SectionTitle>Bisa Diambil Alih</SectionTitle>
                <Text style={styles.roleBig}>{escalatedCount} pengajuan</Text>
                <Text style={styles.linkText}>Tinjau sekarang →</Text>
              </View>
            </Plate>
          </TouchableOpacity>
        ) : null}

        {/* AKTIVITAS TERAKHIR */}
        <Plate style={styles.sectionPlate}>
          <View style={styles.sectionInner}>
            <SectionTitle>Aktivitas Terakhir</SectionTitle>
            <View style={styles.activityRow}>
              <MedallionIcon glyph="check" size={38} variant="ink" />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Clock in • 08.02</Text>
                <Text style={styles.activitySub}>Senin, 12 Okt 2026 • Tepat waktu</Text>
              </View>
              <StampChip color={colors.green} backgroundColor={colors.greenBg}>
                Hadir
              </StampChip>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityRow}>
              <MedallionIcon glyph="file_text" size={38} variant="ink" />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Pengajuan cuti disetujui</Text>
                <Text style={styles.activitySub}>3 Okt 2026 • oleh Dimas Prasetyo</Text>
              </View>
              <StampChip color={colors.blue} backgroundColor={colors.blueBg}>
                Cuti
              </StampChip>
            </View>
          </View>
        </Plate>
      </ScrollView>
    </View>
  );
}

const CLOCK_DIAMETER = 224;

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  hero: {
    paddingBottom: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  greetingRow: { alignItems: 'center', flexDirection: 'row', flex: 1 },
  greetingText: { marginLeft: 12, flex: 1 },
  greetingSmall: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: serifFamily('700'),
    fontSize: 12,
  },
  greetingName: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 20,
    marginTop: 2,
  },
  dateLine: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'serif',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  bell: { position: 'relative' },
  bellDot: {
    backgroundColor: colors.clockOutFrom,
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 4,
    top: 4,
    width: 10,
  },
  statusPlate: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  statusInner: { padding: spacing.md },
  timeCols: { flexDirection: 'row', marginTop: spacing.md },
  timeCol: { alignItems: 'center', flex: 1 },
  timeValue: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 18 },
  timeLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 11,
    marginTop: 2,
  },
  timeDivider: { backgroundColor: colors.line, width: 1 },
  clockWrap: { alignItems: 'center', paddingTop: spacing.lg },
  clockCenter: {
    alignItems: 'center',
    height: CLOCK_DIAMETER,
    justifyContent: 'center',
    width: CLOCK_DIAMETER,
  },
  pulseRing: {
    borderColor: colors.indigo,
    borderRadius: 120,
    borderWidth: 2,
    height: 240,
    left: -8,
    position: 'absolute',
    top: -8,
    width: 240,
  },
  clockShadow: {
    backgroundColor: colors.etch,
    borderRadius: CLOCK_DIAMETER / 2,
    height: CLOCK_DIAMETER,
    left: 3,
    position: 'absolute',
    top: 3,
    width: CLOCK_DIAMETER,
  },
  clockPlate: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: CLOCK_DIAMETER / 2,
    borderWidth: 1.5,
    height: CLOCK_DIAMETER,
    justifyContent: 'center',
    overflow: 'hidden',
    width: CLOCK_DIAMETER,
  },
  clockPlateOut: { backgroundColor: colors.orangeBg },
  clockDimmed: { opacity: 0.55 },
  sunburst: {
    height: 200,
    left: (CLOCK_DIAMETER - 200) / 2,
    opacity: 0.6,
    position: 'absolute',
    top: (CLOCK_DIAMETER - 200) / 2,
    width: 200,
  },
  clockLabel: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 19,
    marginTop: 6,
  },
  clockTime: {
    color: colors.ink2,
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginTop: 2,
  },
  clockHint: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.md,
  },
  hoursPlate: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  hoursInner: { padding: spacing.md },
  hoursRow: { alignItems: 'center', flexDirection: 'row' },
  hoursText: {
    color: colors.ink2,
    flex: 1,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginLeft: 12,
  },
  hoursDivider: { backgroundColor: colors.line, height: 1, marginVertical: spacing.sm },
  shortcutGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  shortcutTouch: { flex: 1 },
  shortcutPlate: { flex: 1 },
  shortcutInner: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: spacing.md,
  },
  shortcutLabel: {
    color: colors.ink,
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTouch: { marginTop: spacing.md },
  sectionPlate: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  sectionPlateTight: { marginHorizontal: spacing.lg },
  sectionInner: { padding: spacing.lg },
  sectionHead: { marginBottom: spacing.sm },
  sectionTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 16,
  },
  doubleRule: { marginTop: 6 },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleGap: { height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1 },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  quotaLabel: { color: colors.ink, fontFamily: fontFamily('600'), fontSize: 13 },
  quotaValue: { color: colors.ink2, fontFamily: fontFamily('400'), fontSize: 13 },
  linkText: {
    color: colors.indigo,
    fontFamily: fontFamily('700'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  roleBig: {
    color: colors.indigo,
    fontFamily: serifFamily('800'),
    fontSize: 26,
  },
  activityRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 8 },
  activityText: { flex: 1, marginLeft: 12, marginRight: 8 },
  activityTitle: { color: colors.ink, fontFamily: fontFamily('600'), fontSize: 13 },
  activitySub: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  activityDivider: { backgroundColor: colors.line, height: 1, marginLeft: 50 },
});
