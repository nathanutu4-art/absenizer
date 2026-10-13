import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { GradientView } from '../../src/components/GradientView';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { StampChip } from '../../src/components/StampChip';
import { getPicOf, type Employee } from '../../src/data/demo';
import { HATCH_TILE } from '../../src/data/medallions';
import { getEmployees } from '../../src/lib/db';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_LABEL = { hadir: 'Hadir', sakit: 'Sakit', cuti: 'Cuti', ijin: 'Ijin' } as const;

/** Detail Karyawan — hero ukiran + kartu keterangan + kartu PIC. */
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
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Memuat…</Text>
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Karyawan tidak ditemukan.</Text>
      </SafeAreaView>
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
      <ScrollView>
        <GradientView kind="hero" style={styles.hero}>
          <Image
            source={{ uri: HATCH_TILE }}
            resizeMode="repeat"
            style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}
          />
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <MedallionIcon glyph="chevron_left" size={36} variant="cream" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Karyawan</Text>
              <View style={styles.backSpacer} />
            </View>
            <View style={styles.profileRow}>
              <Avatar gradientId={employee.gradientId} name={employee.name} size={76} shape="square" />
              <View style={styles.profileText}>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.position}>{employee.position}</Text>
                <StampChip
                  color="#ffffff"
                  backgroundColor="rgba(255,255,255,0.14)"
                  style={styles.statusChip}
                >
                  {STATUS_LABEL[employee.status]}
                </StampChip>
              </View>
            </View>
          </SafeAreaView>
        </GradientView>

        <View style={styles.body}>
          <View style={styles.sectionHead}>
            <Text style={styles.cardTitle}>Keterangan Karyawan</Text>
            <View style={styles.ruleThick} />
            <View style={styles.ruleThin} />
          </View>
          {kv.map(([label, value]) => (
            <Plate key={label} style={styles.kvWrap}>
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
            <Plate style={styles.picWrap}>
              <View style={styles.picRow}>
                <Avatar gradientId={pic.gradientId} name={pic.name} size={46} shape="square" />
                <View style={styles.picText}>
                  <Text style={styles.picName}>{pic.name}</Text>
                  <Text style={styles.picPos}>{pic.position}</Text>
                </View>
              </View>
            </Plate>
          ) : (
            <Text style={styles.fallbackText}>Belum ada PIC terdaftar.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
  },
  fallbackText: { color: colors.ink2, fontFamily: fontFamily('500') },
  hero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backSpacer: { height: 36, width: 36 },
  headerTitle: { color: '#fff', fontFamily: serifFamily('800'), fontSize: 18 },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  profileText: { flex: 1, marginLeft: spacing.md },
  name: { color: '#fff', fontFamily: serifFamily('800'), fontSize: 22 },
  position: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  statusChip: { marginTop: 10 },
  body: { padding: spacing.lg },
  sectionHead: { marginBottom: spacing.sm },
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
  kvLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 12 },
  kvValue: {
    color: colors.ink,
    fontFamily: fontFamily('600'),
    fontSize: 14,
    marginTop: 3,
  },
  picWrap: { marginTop: 4 },
  picRow: { alignItems: 'center', flexDirection: 'row', padding: spacing.md },
  picText: { flex: 1, marginLeft: 12 },
  picName: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  picPos: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
});
