import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../src/components/AppIcon';
import { Avatar } from '../../src/components/Avatar';
import { GradientView } from '../../src/components/GradientView';
import { ThemedButton } from '../../src/components/ThemedButton';
import { showToast } from '../../src/components/Toast';
import { getEmployee, getPicOf } from '../../src/data/demo';
import { clearSession, getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

const ROLE_EMPLOYEE: Record<DemoRole, string> = {
  karyawan: 'nadia',
  pic: 'dimas',
  hr: 'sari',
};

/** Profil — data diri + kartu PIC + keluar. */
export default function ProfileScreen() {
  const [role, setRole] = useState<DemoRole>('karyawan');

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  const me = getEmployee(ROLE_EMPLOYEE[role]);
  const pic = getPicOf(me);

  const kv: [string, string][] = [
    ['Nomor Karyawan', me.employeeNo],
    ['Jabatan', me.position],
    ['Tanggal Lahir', me.birthDate],
    ['Email', me.email],
    ['Telepon', me.phone],
    ['Lama Bekerja', me.tenure],
  ];

  async function handleLogout() {
    await clearSession();
    router.replace('/login');
  }

  return (
    <View style={styles.root}>
      <ScrollView>
        <GradientView kind="hero" style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.headerTitle}>Profil</Text>
            <View style={styles.profileRow}>
              <Avatar gradientId={me.gradientId} name={me.name} size={76} />
              <View style={styles.profileText}>
                <Text style={styles.name}>{me.name}</Text>
                <Text style={styles.position}>{me.position}</Text>
                <Text style={styles.empNo}>{me.employeeNo}</Text>
              </View>
            </View>
          </SafeAreaView>
        </GradientView>

        <View style={styles.body}>
          <View style={styles.kvCard}>
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
            <Text style={styles.cardTitle}>PIC Saya</Text>
            <View style={styles.picRow}>
              <Avatar gradientId={pic.gradientId} name={pic.name} size={46} />
              <View style={styles.picText}>
                <Text style={styles.picName}>{pic.name}</Text>
                <Text style={styles.picPos}>{pic.position}</Text>
              </View>
            </View>
            <View style={styles.picActions}>
              <TouchableOpacity
                onPress={() => showToast(`Menghubungi ${pic.name}…`)}
                style={styles.picBtn}
              >
                <View style={styles.picBtnLabel}>
                  <AppIcon color={colors.indigo} name="phone" size={16} />
                  <Text style={styles.picBtnText}>Hubungi PIC</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showToast(`Pesan untuk ${pic.name} disiapkan.`)}
                style={styles.picBtn}
              >
                <View style={styles.picBtnLabel}>
                  <AppIcon color={colors.indigo} name="message_circle" size={16} />
                  <Text style={styles.picBtnText}>Kirim Pesan</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <ThemedButton
            onPress={handleLogout}
            style={styles.logout}
            title="Keluar dari Akun"
            variant="dangerOutline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  hero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: fontFamily('800'),
    fontSize: 19,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
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
  empNo: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: 2,
  },
  body: { padding: spacing.lg },
  kvCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: spacing.lg,
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
  cardTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
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
  picActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  picBtn: {
    alignItems: 'center',
    backgroundColor: colors.blueBg,
    borderRadius: radius.button,
    flex: 1,
    paddingVertical: 12,
  },
  picBtnText: { color: colors.indigo, fontFamily: fontFamily('700'), fontSize: 13, marginLeft: 6 },
  picBtnLabel: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  logout: {
    borderColor: '#f3c2c2',
    marginTop: spacing.lg,
  },
});
