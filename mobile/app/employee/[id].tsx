import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { Skeleton } from '../../src/components/Skeleton';
import { StampChip } from '../../src/components/StampChip';
import { getPicOf, type Employee } from '../../src/data/demo';
import { getEmployees } from '../../src/lib/db';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_LABEL = { hadir: 'Hadir', sakit: 'Sakit', cuti: 'Cuti', ijin: 'Ijin' } as const;

/**
 * Foto profil valid hanya bila URL absolut (http/https) atau data-URI.
 * Nilai relatif seperti "/dummy-avatar.jpg" dari DB dikembalikan sebagai
 * undefined agar Avatar menampilkan fallback gradasi/inisial.
 */
function validPhoto(url?: string | null): string | undefined {
  return url && /^(https?:\/\/|data:)/i.test(url) ? url : undefined;
}

/** Detail Karyawan — tema dashboard: gradient putih, kartu biru solid. */
export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loaded, setLoaded] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [pic, setPic] = useState<Employee | null>(null);

  // Muat dari Supabase bila tersedia (fallback demo di dalam getEmployees).
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getEmployees();
      if (!alive) return;
      const emp = list.find((e) => e.id === id) ?? null;
      setEmployee(emp);
      if (emp) {
        let p: Employee | null = null;
        if (emp.picId) p = list.find((e) => e.id === emp.picId) ?? null;
        if (!p) {
          try {
            p = getPicOf(emp);
          } catch {
            p = null;
          }
        }
        setPic(p);
      }
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!loaded) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#ffffff', '#eef3fa']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.fallback}>
          <View style={styles.skeletonHead}>
            <Skeleton width={76} height={76} borderRadius={2} />
            <View style={styles.skeletonHeadText}>
              <Skeleton width={160} height={22} />
              <Skeleton width={110} height={14} style={styles.skeletonGap} />
            </View>
          </View>
          <View style={styles.skeletonBody}>
            <Skeleton width="100%" height={54} style={styles.skeletonGap} />
            <Skeleton width="100%" height={54} style={styles.skeletonGap} />
            <Skeleton width="100%" height={54} style={styles.skeletonGap} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#ffffff', '#eef3fa']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.fallback}>
          <Text style={styles.fallbackText}>Karyawan tidak ditemukan.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const kv: [string, string][] = [
    ['Nomor Karyawan', employee.employeeNo],
    ['Jabatan', employee.position],
    ['Tanggal Lahir', employee.birthDate],
    ['Email', employee.email],
    ['Telepon', employee.phone],
    ['Lama Bekerja', `${employee.tenure} • sejak ${employee.joinDate}`],
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MedallionIcon glyph="chevron_left" size={36} variant="wadaIndigo" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Karyawan</Text>
            <View style={styles.backSpacer} />
          </View>

          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar gradientId={employee.gradientId} name={employee.name} size={76} shape="square" photoUri={validPhoto(employee.photoUrl)} />
              <View style={styles.profileText}>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.position}>{employee.position}</Text>
                <StampChip
                  color="#ffffff"
                  backgroundColor="rgba(255,255,255,0.2)"
                  style={styles.statusChip}
                >
                  {STATUS_LABEL[employee.status]}
                </StampChip>
              </View>
            </View>
          </Plate>

          <View style={styles.sectionHead}>
            <Text style={styles.cardTitle}>Keterangan Karyawan</Text>
            <View style={styles.ruleThick} />
            <View style={styles.ruleThin} />
          </View>
          {kv.map(([label, value]) => (
            <Plate key={label} solidColor="rgba(2,85,179,0.85)" style={styles.kvWrap}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label}</Text>
                <Text style={styles.kvValue}>{value}</Text>
              </View>
            </Plate>
          ))}

          <View style={styles.sectionHead}>
            <Text style={styles.cardTitle}>Info PIC</Text>
            <View style={styles.ruleThick} />
            <View style={styles.ruleThin} />
          </View>
          {pic ? (
            <Plate solidColor="rgba(2,85,179,0.85)" style={styles.picWrap}>
              <View style={styles.picRow}>
                <Avatar gradientId={pic.gradientId} name={pic.name} size={46} shape="square" photoUri={validPhoto(pic.photoUrl)} />
                <View style={styles.picText}>
                  <Text style={styles.picName}>{pic.name}</Text>
                  <Text style={styles.picPos}>{pic.position}</Text>
                </View>
              </View>
            </Plate>
          ) : (
            <Text style={styles.fallbackText}>Belum ada PIC terdaftar.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  fallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  fallbackText: { color: colors.ink2, fontFamily: fontFamily('500') },
  skeletonHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  skeletonHeadText: { flex: 1, marginLeft: spacing.md },
  skeletonGap: { marginTop: spacing.sm },
  skeletonBody: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, width: '100%' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backSpacer: { height: 36, width: 36 },
  headerTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 20,
  },
  profileCard: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  profileText: { flex: 1, marginLeft: spacing.md },
  name: { color: '#ffffff', fontFamily: serifFamily('800'), fontSize: 22 },
  position: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  statusChip: { marginTop: 10 },
  sectionHead: { marginBottom: spacing.sm, marginTop: spacing.md },
  cardTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    marginBottom: 6,
  },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  kvWrap: { marginBottom: spacing.sm },
  kvRow: { paddingHorizontal: spacing.md, paddingVertical: 10 },
  kvLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
  },
  kvValue: {
    color: '#ffffff',
    fontFamily: fontFamily('600'),
    fontSize: 14,
    marginTop: 3,
  },
  picWrap: { marginTop: 4 },
  picRow: { alignItems: 'center', flexDirection: 'row', padding: spacing.md },
  picText: { flex: 1, marginLeft: 12 },
  picName: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 14 },
  picPos: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
});
