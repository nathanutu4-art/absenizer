import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { GradientView } from '../../src/components/GradientView';
import { StatusChip } from '../../src/components/StatusChip';
import { showToast } from '../../src/components/Toast';
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
import { colors, fontFamily, radius, spacing } from '../../src/theme';

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

  const shortcuts =
    role === 'karyawan'
      ? [
          { label: 'Pengajuan', glyph: '📝', route: '/(tabs)/requests' },
          { label: 'Tim', glyph: '👥', route: '/(tabs)/team' },
          { label: 'Riwayat', glyph: '🕘', route: '/(tabs)/history' },
          { label: 'Profil', glyph: '👤', route: '/(tabs)/profile' },
        ]
      : role === 'pic'
        ? [
            { label: 'Persetujuan', glyph: '✅', route: '/(tabs)/approvals' },
            { label: 'Tim', glyph: '👥', route: '/(tabs)/team' },
            { label: 'Profil', glyph: '👤', route: '/(tabs)/profile' },
          ]
        : [
            { label: 'Ambil Alih', glyph: '🔁', route: '/(tabs)/takeover' },
            { label: 'Tim', glyph: '👥', route: '/(tabs)/team' },
            { label: 'Profil', glyph: '👤', route: '/(tabs)/profile' },
          ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HERO */}
        <GradientView kind="hero" style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <View style={styles.greetingRow}>
                <Avatar gradientId={me.gradientId} name={me.name} size={46} />
                <View style={styles.greetingText}>
                  <Text style={styles.greetingSmall}>
                    Selamat datang, {ROLE_LABEL[role]}
                  </Text>
                  <Text style={styles.greetingName}>{me.name}</Text>
                  <Text style={styles.dateLine}>{todayLine()}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => showToast('Belum ada notifikasi baru.')}
                style={styles.bell}
              >
                <Text style={styles.bellGlyph}>🔔</Text>
                <View style={styles.bellDot} />
              </TouchableOpacity>
            </View>

            {/* Kartu status kaca */}
            <View style={styles.glassCard}>
              <StatusChip
                label={statusChip}
                tone={clock.phase === 'in' ? 'neutral' : 'green'}
                style={styles.statusChip}
              />
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
          </SafeAreaView>
        </GradientView>

        {/* TOMBOL CLOCK */}
        <View style={styles.clockWrap}>
          <View style={styles.clockCenter}>
            <Animated.View
              style={[
                styles.pulseRing,
                { opacity: clock.phase === 'done' ? 0 : ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={handleClockPress}
              style={clock.phase === 'done' && styles.clockDimmed}
            >
              <GradientView
                imageStyle={{ borderRadius: 84 }}
                kind={clock.phase === 'out' ? 'clockOut' : 'primary'}
                style={[styles.clockButton, clock.phase === 'done' && styles.clockDone]}
              >
                <Text style={styles.clockLabel}>{clockLabel}</Text>
                <Text style={styles.clockTime}>{wib} WIB</Text>
              </GradientView>
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

        {/* INFO MINI */}
        <View style={styles.minis}>
          <View style={styles.mini}>
            <Text style={styles.miniGlyph}>🕗</Text>
            <Text style={styles.miniText}>
              {WORK_START}–{WORK_END} • toleransi {LATE_TOLERANCE_MIN} mnt
            </Text>
          </View>
          <View style={styles.mini}>
            <Text style={styles.miniGlyph}>📍</Text>
            <Text style={styles.miniText}>
              WFO {OFFICE_NAME} • geofence {GEOFENCE_M.toLocaleString('id-ID')} m
            </Text>
          </View>
        </View>

        {/* SHORTCUT */}
        <View style={styles.shortcutGrid}>
          {shortcuts.map((s) => (
            <TouchableOpacity
              key={s.label}
              onPress={() => router.push(s.route as never)}
              style={styles.shortcut}
            >
              <Text style={styles.shortcutGlyph}>{s.glyph}</Text>
              <Text style={styles.shortcutLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEKSI PERAN */}
        {role === 'karyawan' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sisa Kuota</Text>
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
        ) : null}
        {role === 'pic' ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/approvals')}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Menunggu Persetujuan</Text>
            <Text style={styles.roleBig}>{pendingCount} pengajuan</Text>
            <Text style={styles.linkText}>Tinjau sekarang →</Text>
          </TouchableOpacity>
        ) : null}
        {role === 'hr' ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/takeover')}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Bisa Diambil Alih</Text>
            <Text style={styles.roleBig}>{escalatedCount} pengajuan</Text>
            <Text style={styles.linkText}>Tinjau sekarang →</Text>
          </TouchableOpacity>
        ) : null}

        {/* AKTIVITAS TERAKHIR */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Clock in • 08.02</Text>
              <Text style={styles.activitySub}>Senin, 12 Okt 2026 • Tepat waktu</Text>
            </View>
            <StatusChip label="Hadir" tone="green" />
          </View>
          <View style={styles.activityDivider} />
          <View style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Pengajuan cuti disetujui</Text>
              <Text style={styles.activitySub}>3 Okt 2026 • oleh Dimas Prasetyo</Text>
            </View>
            <StatusChip label="Cuti" tone="blue" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  hero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
  },
  greetingName: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 18 },
  dateLine: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  bell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bellGlyph: { fontSize: 20 },
  bellDot: {
    backgroundColor: '#f59e0b',
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 10,
    top: 10,
    width: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.card,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  statusChip: { backgroundColor: 'rgba(255,255,255,0.9)' },
  timeCols: { flexDirection: 'row', marginTop: spacing.md },
  timeCol: { alignItems: 'center', flex: 1 },
  timeValue: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 18 },
  timeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily('500'),
    fontSize: 11,
    marginTop: 2,
  },
  timeDivider: { backgroundColor: 'rgba(255,255,255,0.3)', width: 1 },
  clockWrap: { alignItems: 'center', marginTop: -10, paddingTop: spacing.lg },
  clockCenter: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    borderColor: colors.indigo,
    borderRadius: 96,
    borderWidth: 2,
    height: 192,
    position: 'absolute',
    width: 192,
  },
  clockButton: {
    alignItems: 'center',
    borderRadius: 84,
    height: 168,
    justifyContent: 'center',
    width: 168,
  },
  clockDimmed: { opacity: 0.55 },
  clockDone: { opacity: 0.55 },
  clockLabel: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 21 },
  clockTime: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginTop: 4,
  },
  clockHint: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.md,
  },
  minis: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  mini: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  miniGlyph: { fontSize: 20, marginRight: 8 },
  miniText: { color: colors.ink2, flex: 1, fontFamily: fontFamily('500'), fontSize: 12 },
  shortcutGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  shortcut: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    paddingVertical: spacing.md,
  },
  shortcutGlyph: { fontSize: 24 },
  shortcutLabel: {
    color: colors.ink,
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
  },
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
    fontFamily: fontFamily('800'),
    fontSize: 26,
  },
  activityRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 8 },
  activityDot: {
    backgroundColor: colors.indigo,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  activityText: { flex: 1, marginLeft: 12 },
  activityTitle: { color: colors.ink, fontFamily: fontFamily('600'), fontSize: 13 },
  activitySub: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  activityDivider: { backgroundColor: colors.line, height: 1, marginLeft: 22 },
});
