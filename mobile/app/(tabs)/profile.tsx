import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../src/components/AppIcon';
import { Avatar } from '../../src/components/Avatar';
import { GradientView } from '../../src/components/GradientView';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { StampChip } from '../../src/components/StampChip';
import { showToast } from '../../src/components/Toast';
import { getEmployee, getPicOf } from '../../src/data/demo';
import { HATCH_TILE } from '../../src/data/medallions';
import { AVATAR_PLACEHOLDER } from '../../src/data/avatar-placeholder';
import { clearSession, getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

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
          <Image
            source={{ uri: HATCH_TILE }}
            resizeMode="repeat"
            style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}
          />
          <SafeAreaView edges={['top']}>
            <Text style={styles.headerTitle}>Profil</Text>
            <View style={styles.profileRow}>
              <View style={styles.avatarFrame}>
                <Image
                  source={{ uri: AVATAR_PLACEHOLDER }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.profileText}>
                <Text style={styles.name}>{me.name}</Text>
                <Text style={styles.position}>{me.position}</Text>
                <Text style={styles.empNo}>{me.employeeNo}</Text>
                <StampChip
                  color="#ffffff"
                  backgroundColor="rgba(255,255,255,0.14)"
                  style={styles.statusChip}
                >
                  AKTIF • WFO
                </StampChip>
              </View>
            </View>
          </SafeAreaView>
        </GradientView>

        <View style={styles.body}>
          {kv.map(([label, value]) => (
            <Plate key={label} style={styles.kvWrap}>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label}</Text>
                <Text style={styles.kvValue}>{value}</Text>
              </View>
            </Plate>
          ))}

          <Plate style={styles.picWrap}>
            <View style={styles.picInner}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>PIC Saya</Text>
                <View style={styles.ruleThick} />
                <View style={styles.ruleThin} />
              </View>
              <View style={styles.picRow}>
                <Avatar gradientId={pic.gradientId} name={pic.name} size={46} />
                <View style={styles.picText}>
                  <Text style={styles.picName}>{pic.name}</Text>
                  <Text style={styles.picPos}>{pic.position}</Text>
                </View>
              </View>
              <View style={styles.picActions}>
                <PlateButton
                  onPress={() => showToast(`Menghubungi ${pic.name}…`)}
                  variant="paper"
                  style={styles.picBtn}
                >
                  <View style={styles.picBtnLabel}>
                    <AppIcon color={colors.wadaIndigo} name="phone" size={16} />
                    <Text style={styles.picBtnText}>Hubungi PIC</Text>
                  </View>
                </PlateButton>
                <PlateButton
                  onPress={() => showToast(`Pesan untuk ${pic.name} disiapkan.`)}
                  variant="paper"
                  style={styles.picBtn}
                >
                  <View style={styles.picBtnLabel}>
                    <AppIcon color={colors.wadaIndigo} name="message_circle" size={16} />
                    <Text style={styles.picBtnText}>Kirim Pesan</Text>
                  </View>
                </PlateButton>
              </View>
            </View>
          </Plate>

          <PlateButton
            onPress={handleLogout}
            variant="danger"
            style={styles.logout}
          >
            Keluar dari Akun
          </PlateButton>
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
    fontFamily: serifFamily('800'),
    fontSize: 20,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
  },
  /** Bingkai foto profil persegi ala bingkai gambar (sama seperti dashboard). */
  avatarFrame: {
    backgroundColor: colors.paper2,
    borderColor: colors.etch,
    borderWidth: 2,
    padding: 3,
  },
  avatarImage: {
    borderColor: colors.etch,
    borderWidth: 1,
    height: 68,
    width: 68,
  },
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
  empNo: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: { marginTop: 10 },
  body: { padding: spacing.lg },
  kvWrap: { marginBottom: spacing.sm },
  kvRow: { paddingHorizontal: spacing.md, paddingVertical: 10 },
  kvLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 12 },
  kvValue: {
    color: colors.ink,
    fontFamily: fontFamily('600'),
    fontSize: 14,
    marginTop: 3,
  },
  picWrap: { marginTop: spacing.sm },
  picInner: { padding: spacing.lg },
  sectionHead: { marginBottom: spacing.sm },
  cardTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    marginBottom: 6,
  },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
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
  picBtn: { flex: 1 },
  picBtnText: {
    color: colors.etch,
    fontFamily: fontFamily('700'),
    fontSize: 12,
    marginLeft: 6,
  },
  picBtnLabel: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  logout: { marginTop: spacing.lg },
});
