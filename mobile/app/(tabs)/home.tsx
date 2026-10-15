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
import { MedallionIcon, type MedallionVariant } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { LiquidGlassCard } from '../../src/components/LiquidGlassCard';
import { SketchClock } from '../../src/components/SketchClock';
import { Skeleton } from '../../src/components/Skeleton';
import { BG_ABSTRACT } from '../../src/data/bgAbstract';
import { BlurView } from 'expo-blur';
import { StampChip } from '../../src/components/StampChip';
import { showToast } from '../../src/components/Toast';
import type { IconName } from '../../src/data/icons';
import { HATCH_TILE, SUNBURST_APRICOT } from '../../src/data/medallions';
import { AVATAR_PLACEHOLDER } from '../../src/data/avatar-placeholder';
import { DUMMY_AVATAR } from '../../src/data/dummy-avatar';
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
import { getActiveRole, getSession, type DemoRole } from '../../src/lib/session';
import { getCompanySettings, getMyEmployee, getMyLeaveBalance, getRecentActivities, saveClockOut, type RecentActivity } from '../../src/lib/db';
import { calcDuration } from '../../src/lib/duration';
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
  // Animasi pop-up lingkaran clock saat muncul (scale 0 -> 1).
  const popIn = useRef(new Animated.Value(0)).current;
  // Nama & foto pengguna yang login (dari DB bila tersedia).
  const [meName, setMeName] = useState<string | null>(null);
  const [mePhoto, setMePhoto] = useState<string | null>(null);
  const [meLoading, setMeLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  // Sisa kuota cuti/ijin dari database (leave_balances); fallback ke
  // default company_settings bila baris belum ada. Sesi demo: data demo.
  const [quotaRows, setQuotaRows] = useState<
    { label: string; remaining: string }[]
  >([]);

  // Aktivitas terakhir dari database; [] = seksi disembunyikan.
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const session = await getSession();
      if (!alive) return;
      setIsDemo(session?.demo !== false);
      const me = await getMyEmployee();
      if (!alive) return;
      if (me) {
        setMeName(me.name);
        setMePhoto(me.photoUrl ?? null);
      }
      setMeLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const session = await getSession();
      if (!alive) return;
      if (session?.demo !== false) {
        // Sesi demo: tampilkan angka demo.
        setQuotaRows(
          QUOTAS.slice(0, 2).map((q) => ({
            label: q.type === 'cuti' ? 'Cuti' : 'Ijin',
            remaining:
              q.total !== null
                ? `${q.total - q.used} dari ${q.total} tersisa`
                : 'Tanpa batas',
          })),
        );
        return;
      }
      try {
        const [balance, settings] = await Promise.all([
          getMyLeaveBalance(),
          getCompanySettings(),
        ]);
        if (!alive) return;
        // Kuota penuh bila belum ada pemakaian (used = 0/null);
        // sisa = kuota - terpakai.
        const cutiQuota = balance?.cutiQuota ?? settings.cutiQuotaDefault;
        const cutiUsed = balance?.cutiUsed ?? 0;
        const ijinQuota = balance?.ijinQuota ?? settings.ijinQuotaDefault;
        const ijinUsed = balance?.ijinUsed ?? 0;
        setQuotaRows([
          {
            label: 'Cuti',
            remaining: `${cutiQuota - cutiUsed} dari ${cutiQuota} tersisa`,
          },
          {
            label: 'Ijin',
            remaining: `${ijinQuota - ijinUsed} dari ${ijinQuota} tersisa`,
          },
        ]);
      } catch {
        if (!alive) return;
        setQuotaRows([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const avatarUri = isDemo
    ? AVATAR_PLACEHOLDER
    : mePhoto && /^https?:\/\//i.test(mePhoto)
      ? mePhoto
      : DUMMY_AVATAR;

  const pulse = useRef(new Animated.Value(0)).current;

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

  // Muat aktivitas terakhir dari database (sembunyikan bila kosong).
  useEffect(() => {
    let alive = true;
    (async () => {
      const session = await getSession();
      if (!alive) return;
      if (session?.demo === false) {
        const acts = await getRecentActivities();
        if (alive) setActivities(acts);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Pop-up lingkaran clock saat layar muncul.
  useEffect(() => {
    Animated.spring(popIn, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [popIn]);

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
      // Simpan clock-out ke Supabase (best-effort; status lokal sudah benar).
      saveClockOut({ coords: null }).then((ok) => {
        if (!ok) showToast('Clock out tersimpan lokal; sinkronisasi menyusul.');
      });
    } else {
      showToast('Absensi hari ini sudah lengkap.');
    }
  }

  const clockLabel =
    clock.phase === 'in' ? 'Clock In' : clock.phase === 'out' ? 'Clock Out' : 'Selesai';
  const statusChip =
    clock.phase === 'in' ? 'Belum Clock In' : clock.phase === 'out' ? 'Sudah Clock In' : 'Selesai';

  const shortcuts: { label: string; icon: IconName; route: string; variant: MedallionVariant }[] =
    role === 'karyawan'
      ? [
          { label: 'Pengajuan', icon: 'file_text', route: '/(tabs)/requests', variant: 'wadaApricot' },
          { label: 'Tim', icon: 'users', route: '/(tabs)/team', variant: 'wadaApricot' },
          { label: 'Riwayat', icon: 'clock', route: '/(tabs)/history', variant: 'wadaApricot' },
          { label: 'Profil', icon: 'user', route: '/(tabs)/profile', variant: 'wadaApricot' },
        ]
      : role === 'pic'
        ? [
            { label: 'Persetujuan', icon: 'check_circle', route: '/(tabs)/approvals', variant: 'wadaApricot' },
            { label: 'Tim', icon: 'users', route: '/(tabs)/team', variant: 'wadaApricot' },
            { label: 'Profil', icon: 'user', route: '/(tabs)/profile', variant: 'wadaApricot' },
          ]
        : [
            { label: 'Ambil Alih', icon: 'repeat', route: '/(tabs)/takeover', variant: 'wadaOlive' },
            { label: 'Tim', icon: 'users', route: '/(tabs)/team', variant: 'wadaApricot' },
            { label: 'Profil', icon: 'user', route: '/(tabs)/profile', variant: 'wadaApricot' },
          ];

  return (
    <View style={[styles.root, { backgroundColor: '#0156b3' }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HERO — transparan, teks terang */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <View style={styles.greetingRow}>
                <View style={styles.avatarFrame}>
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.greetingText}>
                  <Text style={styles.greetingSmall}>
                    Selamat datang, {ROLE_LABEL[role]}
                  </Text>
                  {meLoading ? (
                    <Skeleton width={140} height={22} style={styles.nameSkeleton} />
                  ) : (
                    <Text style={styles.greetingName}>{meName ?? me.name}</Text>
                  )}
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
            <LiquidGlassCard tint="light" intensity={40} style={styles.statusPlate} pressable={false} overlayColor="rgba(5,18,48,0.2)">
              <View style={styles.statusInner}>
                <View style={styles.statusHeader}>
                  <StampChip
                    backgroundColor={clock.phase === 'in' ? colors.paper2 : colors.greenBg}
                    color={clock.phase === 'in' ? '#000000' : colors.green}
                  >
                    {statusChip}
                  </StampChip>
                  <Text style={styles.statusDate}>{todayLine()}</Text>
                </View>
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
                      {calcDuration(clock.inTime, clock.outTime)}
                    </Text>
                    <Text style={styles.timeLabel}>Durasi</Text>
                  </View>
                </View>
              </View>
            </LiquidGlassCard>
          </SafeAreaView>
        </View>

        {/* MEDALI CLOCK */}
        <Animated.View style={[styles.clockWrap, { transform: [{ scale: popIn }] }]}>
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
              <BlurView
                intensity={45}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              {/* Ring glow luar */}
              <View style={styles.clockGlowRing} />
              <SketchClock size={160} style={styles.clockMedal} />
              <View style={styles.clockTextWrap}>
                <Text style={styles.clockLabel}>{clockLabel}</Text>
                <Text style={styles.clockTime}>{wib} WIB</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.clockHint}>
            {clock.phase === 'in'
              ? 'Ketuk untuk mulai absensi hari ini'
              : clock.phase === 'out'
                ? 'Ketuk untuk menyelesaikan absensi'
                : 'Terima kasih, absensi hari ini lengkap'}
          </Text>
        </Animated.View>

        {/* JAM KERJA */}
        <Plate glass style={styles.hoursPlate}>
          <View style={styles.hoursInner}>
            <View style={styles.hoursRow}>
              <MedallionIcon glyph="clock" size={40} variant="cream" />
              <Text style={styles.hoursText}>
                {WORK_START}–{WORK_END} • toleransi {LATE_TOLERANCE_MIN} mnt
              </Text>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursRow}>
              <MedallionIcon glyph="map_pin" size={40} variant="cream" />
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
              <Plate glass style={styles.shortcutPlate}>
                <View style={styles.shortcutInner}>
                  <MedallionIcon glyph={s.icon} size={44} variant={s.variant} />
                  <Text style={styles.shortcutLabel}>{s.label}</Text>
                </View>
              </Plate>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEKSI PERAN */}
        {role === 'karyawan' ? (
          <Plate glass style={styles.sectionPlate}>
            <View style={styles.sectionInner}>
              <SectionTitle>Sisa Kuota</SectionTitle>
              {quotaRows.length === 0 ? (
                <>
                  <Skeleton width="100%" height={16} style={styles.quotaSkeleton} />
                  <Skeleton width="100%" height={16} style={styles.quotaSkeleton} />
                </>
              ) : (
                quotaRows.map((q) => (
                  <View key={q.label} style={styles.quotaRow}>
                    <Text style={styles.quotaLabel}>{q.label}</Text>
                    <Text style={styles.quotaValue}>{q.remaining}</Text>
                  </View>
                ))
              )}
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
            <Plate glass style={styles.sectionPlateTight}>
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
            <Plate glass style={styles.sectionPlateTight}>
              <View style={styles.sectionInner}>
                <SectionTitle>Bisa Diambil Alih</SectionTitle>
                <Text style={styles.roleBig}>{escalatedCount} pengajuan</Text>
                <Text style={styles.linkText}>Tinjau sekarang →</Text>
              </View>
            </Plate>
          </TouchableOpacity>
        ) : null}

        {/* AKTIVITAS TERAKHIR — data real; sembunyi bila kosong */}
        {activities.length > 0 ? (
          <Plate glass style={styles.sectionPlate}>
            <View style={styles.sectionInner}>
              <SectionTitle>Aktivitas Terakhir</SectionTitle>
              {activities.map((a, i) => (
                <React.Fragment key={a.id}>
                  {i > 0 ? <View style={styles.activityDivider} /> : null}
                  <View style={styles.activityRow}>
                    <MedallionIcon
                      glyph={
                        a.kind === 'clockin' || a.kind === 'clockout'
                          ? 'check'
                          : 'file_text'
                      }
                      size={38}
                      variant="cream"
                    />
                    <View style={styles.activityText}>
                      <Text style={styles.activityTitle}>{a.title}</Text>
                      <Text style={styles.activitySub}>{a.subtitle}</Text>
                    </View>
                    <StampChip
                      color={
                        a.badge === 'Terlambat' || a.badge === 'Ditolak'
                          ? colors.red
                          : a.badge === 'Menunggu'
                            ? colors.orange
                            : a.kind === 'cuti' || a.kind === 'ijin' || a.kind === 'sakit'
                              ? colors.blue
                              : colors.green
                      }
                      backgroundColor={
                        a.badge === 'Terlambat' || a.badge === 'Ditolak'
                          ? colors.redBg
                          : a.badge === 'Menunggu'
                            ? colors.orangeBg
                            : a.kind === 'cuti' || a.kind === 'ijin' || a.kind === 'sakit'
                              ? colors.blueBg
                              : colors.greenBg
                      }
                    >
                      {a.badge}
                    </StampChip>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Plate>
        ) : null}
      </ScrollView>
    </View>
  );
}

const CLOCK_DIAMETER = 180;

const styles = StyleSheet.create({
  root: { backgroundColor: '#0154b3', flex: 1 },
  scroll: { paddingBottom: 130 },
  hero: {
    paddingBottom: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
  },
  /** Bingkai foto profil persegi ala bingkai gambar. */
  avatarFrame: {
    backgroundColor: colors.paper2,
    borderColor: colors.etch,
    borderWidth: 2,
    padding: 3,
  },
  avatarImage: {
    borderColor: colors.etch,
    borderWidth: 1,
    height: 56,
    width: 56,
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
    fontSize: 26,
    marginTop: 2,
  },
  nameSkeleton: { marginTop: 4 },
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
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusDate: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'serif',
    fontSize: 12,
    fontStyle: 'italic',
  },
  timeCols: { flexDirection: 'row', marginTop: spacing.md },
  timeCol: { alignItems: 'center', flex: 1 },
  timeValue: { color: '#ffffff', fontFamily: fontFamily('800'), fontSize: 18 },
  timeLabel: {
    color: 'rgba(255,255,255,0.75)',
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
    borderColor: '#f68c50',
    borderRadius: CLOCK_DIAMETER / 2,
    borderWidth: 2,
    height: CLOCK_DIAMETER,
    left: 0,
    position: 'absolute',
    top: 0,
    width: CLOCK_DIAMETER,
  },
  clockShadow: {
    display: 'none',
  },
  clockPlate: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'rgba(140,180,255,0.5)',
    borderRadius: CLOCK_DIAMETER / 2,
    borderWidth: 2,
    height: CLOCK_DIAMETER,
    justifyContent: 'center',
    overflow: 'hidden',
    width: CLOCK_DIAMETER,
    shadowColor: '#4d7fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  clockGlowRing: {
    borderColor: 'rgba(246,140,80,0.6)',
    borderRadius: (CLOCK_DIAMETER - 24) / 2,
    borderWidth: 2,
    height: CLOCK_DIAMETER - 24,
    position: 'absolute',
    width: CLOCK_DIAMETER - 24,
    shadowColor: '#f68c50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  clockPlateOut: { borderColor: 'rgba(246,140,80,0.7)' },
  clockDimmed: { opacity: 0.55 },
  sunburst: {
    height: 200,
    left: (CLOCK_DIAMETER - 200) / 2,
    opacity: 0.6,
    position: 'absolute',
    top: (CLOCK_DIAMETER - 200) / 2,
    width: 200,
  },
  clockMedal: {
    left: (CLOCK_DIAMETER - 160) / 2,
    position: 'absolute',
    top: (CLOCK_DIAMETER - 160) / 2 - 8,
  },
  clockTextWrap: {
    alignItems: 'center',
    bottom: 24,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  clockLabel: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 19,
    marginTop: 6,
    textShadowColor: 'rgba(77,127,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  clockTime: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginTop: 2,
  },
  clockHint: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.md,
  },
  hoursPlate: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  hoursInner: { padding: spacing.md },
  hoursRow: { alignItems: 'center', flexDirection: 'row' },
  hoursText: {
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginLeft: 12,
  },
  hoursDivider: { backgroundColor: 'rgba(255,255,255,0.15)', height: 1, marginVertical: spacing.sm },
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
    color: '#ffffff',
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
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 16,
    textShadowColor: 'rgba(77,127,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  doubleRule: { marginTop: 6 },
  ruleThick: { backgroundColor: 'rgba(255,255,255,0.5)', height: 3 },
  ruleGap: { height: 3 },
  ruleThin: { backgroundColor: 'rgba(255,255,255,0.3)', height: 1 },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  quotaLabel: { color: '#ffffff', fontFamily: fontFamily('600'), fontSize: 13 },
  quotaValue: { color: 'rgba(255,255,255,0.8)', fontFamily: fontFamily('400'), fontSize: 13 },
  quotaSkeleton: { marginVertical: 6 },
  linkText: {
    color: colors.wadaApricot,
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
  activityTitle: { color: '#ffffff', fontFamily: fontFamily('600'), fontSize: 13 },
  activitySub: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  activityDivider: { backgroundColor: 'rgba(255,255,255,0.15)', height: 1, marginLeft: 50 },
});
