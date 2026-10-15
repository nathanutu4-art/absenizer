import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { Skeleton } from '../../src/components/Skeleton';
import { StampChip } from '../../src/components/StampChip';
import { EMPLOYEES, type Employee } from '../../src/data/demo';
import { DUMMY_AVATAR } from '../../src/data/dummy-avatar';
import { getAwayEmployees, getEmployees, type AwayEmployee } from '../../src/lib/db';
import { getSession } from '../../src/lib/session';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_LABEL: Record<Employee['status'], string> = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  cuti: 'Cuti',
  ijin: 'Ijin',
};

const STATUS_TONE = {
  hadir: 'green',
  sakit: 'red',
  cuti: 'blue',
  ijin: 'yellow',
} as const;

const STAMP_COLORS = {
  green: { color: colors.green, bg: colors.greenBg },
  yellow: { color: colors.yellowText, bg: colors.yellowBg },
  blue: { color: colors.blue, bg: colors.blueBg },
  red: { color: colors.red, bg: colors.redBg },
} as const;

interface Birthday {
  employee: Employee;
  daysLeft: number;
  turningAge: number;
  dateLabel: string;
}

/**
 * Ulang tahun pada bulan berjalan (Asia/Jakarta) saja,
 * diurutkan berdasarkan tanggal.
 */
function birthdaysThisMonth(list: Employee[]): Birthday[] {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const curY = get('year');
  const curM = get('month');
  const curD = get('day');
  const out: (Birthday & { day: number })[] = [];
  for (const e of list) {
    const [y = 0, m = 0, d = 0] = e.birthISO.split('-').map(Number);
    if (!y || m !== curM) continue;
    out.push({
      employee: e,
      daysLeft: d - curD,
      turningAge: curY - y,
      dateLabel: new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(curY, m - 1, d)),
      day: d,
    });
  }
  return out
    .sort((a, b) => a.day - b.day)
    .map(({ day: _day, ...rest }) => rest);
}

function awayRingColor(status: Employee['status']): string {
  return status === 'sakit'
    ? colors.red
    : status === 'cuti'
      ? colors.blue
      : colors.yellowRing;
}

/** Foto karyawan untuk sesi real: URL absolut bila ada, dummy JPG bila tidak. */
function photoFor(e: Employee): string {
  return e.photoUrl && /^https?:\/\//i.test(e.photoUrl) ? e.photoUrl : DUMMY_AVATAR;
}

/** Info Karyawan — tidak masuk, ulang tahun terdekat, direktori. */
export default function TeamScreen() {
  const [query, setQuery] = useState('');
  // Direktori dimuat dari Supabase bila tersedia; tampilkan demo saat memuat.
  const [directorySrc, setDirectorySrc] = useState<Employee[]>(EMPLOYEES);
  const [dirLoading, setDirLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    getEmployees()
      .then((list) => {
        if (alive) setDirectorySrc(list);
      })
      .finally(() => {
        if (alive) setDirLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  const birthdays = useMemo(() => birthdaysThisMonth(directorySrc), [directorySrc]);

  // "Sedang Tidak Masuk" dari data real (pengajuan disetujui yang mencakup
  // hari ini). Sesi demo: pakai demo bila DB tak terjangkau. Sesi real:
  // tampilkan hanya bila daftar tak kosong — tak pernah data demo.
  const [isDemo, setIsDemo] = useState<boolean | null>(null);
  const [awayDb, setAwayDb] = useState<AwayEmployee[] | null>(null);
  useEffect(() => {
    let alive = true;
    getSession().then((s) => {
      if (alive) setIsDemo(s?.demo !== false);
    });
    getAwayEmployees().then((list) => {
      if (alive) setAwayDb(list);
    });
    return () => {
      alive = false;
    };
  }, []);
  const awayItems: { id: string; name: string; status: Employee['status']; photoUri?: string }[] =
    isDemo === null
      ? []
      : isDemo && awayDb === null
        ? EMPLOYEES.filter((e) => e.status !== 'hadir').map((e) => ({
            id: e.id,
            name: e.name,
            status: e.status,
          }))
        : (awayDb ?? []).map((a) => {
            const emp = directorySrc.find((e) => e.id === a.employeeId);
            return {
              id: a.employeeId,
              name: a.name,
              status: a.type,
              photoUri: emp ? photoFor(emp) : DUMMY_AVATAR,
            };
          });
  const directory = directorySrc.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={[styles.root, { backgroundColor: '#0156b3' }]}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.header}>Info Karyawan</Text>
      <View style={styles.doubleRule}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
      </View>

      {/* Sedang tidak masuk — disembunyikan bila tidak ada */}
      {awayItems.length > 0 ? (
        <>
          <SectionTitle label="Sedang Tidak Masuk" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.awayRow}>
            {awayItems.map((e) => (
              <TouchableOpacity
                key={e.id}
                onPress={() => router.push(`/employee/${e.id}`)}
                style={styles.awayItem}
              >
                <View
                  style={[styles.awayRing, { borderColor: awayRingColor(e.status) }]}
                >
                  {e.photoUri ? (
                    <Avatar name={e.name} photoUri={e.photoUri} size={48} />
                  ) : (
                    <MedallionIcon glyph="user" size={48} />
                  )}
                </View>
                <Text style={styles.awayName} numberOfLines={1}>
                  {e.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.legend}>
            <LegendDot color={colors.red} label="Sakit" />
            <LegendDot color={colors.blue} label="Cuti" />
            <LegendDot color={colors.yellowRing} label="Ijin" />
          </View>
        </>
      ) : null}

      {/* Ulang tahun bulan ini */}
      <SectionTitle label="Ulang Tahun Bulan Ini" />
      <View style={styles.birthGrid}>
        {birthdays.map((b) => (
          <Plate glass key={b.employee.id} style={styles.birthCard}>
            <View style={styles.birthInner}>
              <Avatar
                gradientId={b.employee.gradientId}
                name={b.employee.name}
                photoUri={isDemo ? undefined : photoFor(b.employee)}
                size={38}
              />
              <Text style={styles.birthName} numberOfLines={1}>
                {b.employee.name.split(' ')[0]}
              </Text>
              <Text style={styles.birthDate}>{b.dateLabel}</Text>
              <View style={styles.agePill}>
                <Text style={styles.ageText}>{b.turningAge} thn</Text>
              </View>
              <Text style={styles.countdown}>
                {b.daysLeft === 0
                  ? 'Hari ini!'
                  : b.daysLeft > 0
                    ? `${b.daysLeft} hari lagi`
                    : `${-b.daysLeft} hari lalu`}
              </Text>
            </View>
          </Plate>
        ))}
      </View>

      {/* Direktori */}
      <SectionTitle label="Direktori Karyawan" />
      <View style={styles.searchRow}>
        <MedallionIcon glyph="search" size={32} style={styles.searchMedal} variant="wadaIndigo" />
        <TextInput
          onChangeText={setQuery}
          placeholder="Cari nama karyawan…"
          placeholderTextColor="rgba(255,255,255,0.5)"
          style={styles.searchInput}
          value={query}
        />
      </View>
      {dirLoading ? (
        <>
          <Plate glass style={styles.dirWrap}>
            <View style={styles.dirRow}>
              <Skeleton width={46} height={46} borderRadius={2} />
              <View style={styles.dirSkeletonText}>
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={12} style={styles.dirSkeletonGap} />
              </View>
            </View>
          </Plate>
          <Plate glass style={styles.dirWrap}>
            <View style={styles.dirRow}>
              <Skeleton width={46} height={46} borderRadius={2} />
              <View style={styles.dirSkeletonText}>
                <Skeleton width={120} height={14} />
                <Skeleton width={90} height={12} style={styles.dirSkeletonGap} />
              </View>
            </View>
          </Plate>
          <Plate glass style={styles.dirWrap}>
            <View style={styles.dirRow}>
              <Skeleton width={46} height={46} borderRadius={2} />
              <View style={styles.dirSkeletonText}>
                <Skeleton width={150} height={14} />
                <Skeleton width={95} height={12} style={styles.dirSkeletonGap} />
              </View>
            </View>
          </Plate>
        </>
      ) : (
      directory.map((e) => {
        const stamp = STAMP_COLORS[STATUS_TONE[e.status]];
        return (
          <Plate glass key={e.id} style={styles.dirWrap}>
            <TouchableOpacity
              onPress={() => router.push(`/employee/${e.id}`)}
              style={styles.dirRow}
            >
              <Avatar
                gradientId={e.gradientId}
                name={e.name}
                photoUri={isDemo ? undefined : photoFor(e)}
                shape="square"
                size={46}
              />
              <View style={styles.dirText}>
                <Text style={styles.dirName}>{e.name}</Text>
                <Text style={styles.dirPos}>{e.position}</Text>
              </View>
              <StampChip color={stamp.color} backgroundColor={stamp.bg}>
                {STATUS_LABEL[e.status]}
              </StampChip>
            </TouchableOpacity>
          </Plate>
        );
      })
      )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.ruleThick} />
      <View style={styles.ruleThin} />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 22,
    marginTop: spacing.sm,
  },
  doubleRule: { marginTop: spacing.sm },
  ruleThick: { backgroundColor: 'rgba(255,255,255,0.6)', height: 3 },
  ruleThin: { backgroundColor: 'rgba(255,255,255,0.6)', height: 1, marginTop: 3 },
  sectionHead: { marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 15,
    marginBottom: 6,
  },
  awayRow: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  awayItem: { alignItems: 'center', marginRight: 14, width: 72 },
  awayRing: {
    borderRadius: 34,
    borderWidth: 3,
    padding: 3,
  },
  awayName: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 11,
    marginTop: 6,
  },
  legend: { flexDirection: 'row', marginTop: spacing.sm },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  legendDot: {
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 12,
    width: 12,
  },
  legendLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginLeft: 6,
  },
  birthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  birthCard: { width: '31%' },
  birthInner: { alignItems: 'center', padding: spacing.sm },
  birthName: {
    color: '#ffffff',
    fontFamily: fontFamily('700'),
    fontSize: 12,
    marginTop: 6,
  },
  birthDate: { color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily('500'), fontSize: 11 },
  agePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    borderWidth: 1.5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ageText: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 11 },
  countdown: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 10.5,
    marginTop: 4,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchMedal: { marginRight: 8 },
  searchInput: {
    color: '#ffffff',
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 8,
  },
  dirWrap: { marginBottom: spacing.sm },
  dirSkeletonText: { flex: 1, marginLeft: 12 },
  dirSkeletonGap: { marginTop: 6 },
  dirRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  dirText: { flex: 1, marginLeft: 12 },
  dirName: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 14 },
  dirPos: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
});
