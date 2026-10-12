import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/Avatar';
import { GradientView } from '../../src/components/GradientView';
import { StatusChip } from '../../src/components/StatusChip';
import { getEmployee, getPicOf } from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

const STATUS_LABEL = { hadir: 'Hadir', sakit: 'Sakit', cuti: 'Cuti', ijin: 'Ijin' } as const;
const STATUS_TONE = {
  hadir: 'green',
  sakit: 'red',
  cuti: 'blue',
  ijin: 'yellow',
} as const;

/** Detail Karyawan — hero gradasi + kartu keterangan + kartu PIC. */
export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  let employee;
  try {
    employee = getEmployee(id);
  } catch {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Karyawan tidak ditemukan.</Text>
      </SafeAreaView>
    );
  }
  const pic = getPicOf(employee);

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
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <Text style={styles.backText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Karyawan</Text>
              <View style={styles.backBtn} />
            </View>
            <View style={styles.profileRow}>
              <Avatar gradientId={employee.gradientId} name={employee.name} size={76} />
              <View style={styles.profileText}>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.position}>{employee.position}</Text>
                <StatusChip
                  label={STATUS_LABEL[employee.status]}
                  tone={STATUS_TONE[employee.status]}
                  style={styles.statusChip}
                />
              </View>
            </View>
          </SafeAreaView>
        </GradientView>

        <View style={styles.body}>
          <View style={styles.kvCard}>
            <Text style={styles.cardTitle}>Keterangan Karyawan</Text>
            {kv.map(([label, value], i) => (
              <View key={label}>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>{label}</Text>
                  <Text style={styles.kvValue}>{value}</Text>
                </View>
                {i < kv.length - 1 ? <View style={styles.kvDivider} /> : null}
              </View>
            ))}
          </View>

          <View style={styles.picCard}>
            <Text style={styles.cardTitle}>Info PIC</Text>
            <View style={styles.picRow}>
              <Avatar gradientId={pic.gradientId} name={pic.name} size={46} />
              <View style={styles.picText}>
                <Text style={styles.picName}>{pic.name}</Text>
                <Text style={styles.picPos}>{pic.position}</Text>
              </View>
            </View>
          </View>
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
  backBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: -3 },
  headerTitle: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 17 },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  profileText: { flex: 1, marginLeft: spacing.md },
  name: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 20 },
  position: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  statusChip: { backgroundColor: 'rgba(255,255,255,0.92)', marginTop: 8 },
  body: { padding: spacing.lg },
  kvCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: spacing.lg,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  kvRow: { paddingVertical: 9 },
  kvLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 12 },
  kvValue: {
    color: colors.ink,
    fontFamily: fontFamily('600'),
    fontSize: 14,
    marginTop: 3,
  },
  kvDivider: { backgroundColor: colors.line, height: 1 },
  picCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  picRow: { alignItems: 'center', flexDirection: 'row' },
  picText: { flex: 1, marginLeft: 12 },
  picName: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  picPos: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
});
