import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../../src/components/AppIcon';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { showToast } from '../../src/components/Toast';
import { getEmployee, getPicOf, type Employee } from '../../src/data/demo';
import { HATCH_TILE } from '../../src/data/medallions';
import { AVATAR_PLACEHOLDER } from '../../src/data/avatar-placeholder';
import { DUMMY_AVATAR } from '../../src/data/dummy-avatar';
import { clearSession, getActiveRole, getSession, type DemoRole } from '../../src/lib/session';
import { getEmployees, getMyEmployee, isSupabaseConfigured } from '../../src/lib/db';
import { supabase } from '../../src/lib/supabase';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const ROLE_EMPLOYEE: Record<DemoRole, string> = {
  karyawan: 'nadia',
  pic: 'dimas',
  hr: 'sari',
};

/** Baris kosong (tanda strip) bila data user login tak ditemukan. */
const EMPTY_EMPLOYEE: Employee = {
  id: '',
  gradientId: '01',
  name: '—',
  employeeNo: '—',
  position: '—',
  birthDate: '—',
  birthISO: '',
  email: '—',
  phone: '—',
  joinDate: '—',
  tenure: '—',
  status: 'hadir',
  role: 'karyawan',
};

/** Profil — data diri + kartu PIC + ganti kata sandi + keluar. */
export default function ProfileScreen() {
  const [role, setRole] = useState<DemoRole>('karyawan');
  const [isDemo, setIsDemo] = useState<boolean | null>(null);
  const [meDb, setMeDb] = useState<Employee | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [picDb, setPicDb] = useState<Employee | null>(null);
  const [mePhoto, setMePhoto] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Animasi skeleton saat loading
  const skeletonAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [skeletonAnim]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await getSession();
      const demo = s?.demo !== false;
      if (!alive) return;
      setIsDemo(demo);
      setRole(await getActiveRole());
      if (!demo) {
        const me = await getMyEmployee();
        if (!alive) return;
        setMeDb(me);
        setMeLoaded(true);
        if (me?.photoUrl) setMePhoto(me.photoUrl);
        if (me?.picId) {
          const list = await getEmployees();
          if (!alive) return;
          setPicDb(list.find((e) => e.id === me.picId) ?? null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Sesi demo: data demo. Sesi real: seluruhnya dari user yang login
  // (strip bila tak ditemukan) — tak pernah data demo.
  const demoMe = getEmployee(ROLE_EMPLOYEE[role]);
  const me: Employee = isDemo ? demoMe : (meDb ?? EMPTY_EMPLOYEE);
  const pic: Employee | null = isDemo ? getPicOf(demoMe) : picDb;
  const loading = isDemo === null || (!isDemo && !meLoaded);
  const avatarUri = isDemo
    ? AVATAR_PLACEHOLDER
    : mePhoto && /^https?:\/\//i.test(mePhoto)
      ? mePhoto
      : DUMMY_AVATAR;

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

  async function handleChangePassword() {
    setPwMsg(null);
    if (newPass.length < 6) {
      setPwMsg({ ok: false, text: 'Kata sandi minimal 6 karakter.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPwMsg({ ok: false, text: 'Konfirmasi kata sandi tidak sama.' });
      return;
    }
    setPwBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setNewPass('');
      setConfirmPass('');
      setPwMsg({ ok: true, text: 'Kata sandi berhasil diubah.' });
    } catch (e) {
      setPwMsg({
        ok: false,
        text: e instanceof Error ? e.message : 'Gagal mengubah kata sandi.',
      });
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Background: putih dengan sentuhan gradient lembut */}
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Image
            source={{ uri: HATCH_TILE }}
            resizeMode="repeat"
            style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}
          />
          <Text style={styles.headerTitle}>Profil</Text>
          <Plate solidColor="#1a56a8" style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarFrame}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.profileText}>
                <Text style={styles.name}>{me.name}</Text>
                <Text style={styles.position}>{me.position}</Text>
                <Text style={styles.empNo}>{me.employeeNo}</Text>
                <View style={styles.outlineChip}>
                  <Text style={styles.outlineChipText}>AKTIF • WFO</Text>
                </View>
              </View>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <MedallionIcon glyph="mail" size={24} variant="cream" />
                <Text style={styles.contactText}>{me.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <MedallionIcon glyph="phone" size={24} variant="cream" />
                <Text style={styles.contactText}>{me.phone}</Text>
              </View>
            </View>
          </Plate>
        </View>

        <View style={styles.body}>
          {loading ? (
            /* Skeleton animasi saat data loading */
            <Animated.View
              style={{
                opacity: skeletonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
                </View>
              ))}
            </Animated.View>
          ) : (
            kv.map(([label, value]) => (
              <Plate solidColor="rgba(2,85,179,0.85)" key={label} style={styles.kvWrap}>
                <View style={styles.kvRow}>
                  <Text style={styles.kvLabel}>{label}</Text>
                  <Text style={styles.kvValue}>{value}</Text>
                </View>
              </Plate>
            ))
          )}

          {pic ? (
          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.picWrap}>
            <View style={styles.picInner}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>PIC Saya</Text>
                <View style={styles.ruleThick} />
                <View style={styles.ruleThin} />
              </View>
              <View style={styles.picRow}>
                <Avatar gradientId={pic.gradientId} name={pic.name} size={46} shape="square" />
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
          ) : null}

          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.picWrap}>
            <View style={styles.picInner}>
              <View style={styles.sectionHead}>
                <Text style={styles.cardTitle}>Ganti Kata Sandi</Text>
                <View style={styles.ruleThick} />
                <View style={styles.ruleThin} />
              </View>
              {isDemo || !isSupabaseConfigured() ? (
                <Text style={styles.pwNote}>
                  Mode demo — kata sandi hanya dapat diubah pada akun asli.
                </Text>
              ) : (
                <View>
                  <TextInput
                    onChangeText={(t) => {
                      setNewPass(t);
                      setPwMsg(null);
                    }}
                    placeholder="Kata sandi baru (min. 6 karakter)"
                    placeholderTextColor="#9aa3b5"
                    secureTextEntry
                    style={styles.pwInput}
                    value={newPass}
                  />
                  <TextInput
                    onChangeText={(t) => {
                      setConfirmPass(t);
                      setPwMsg(null);
                    }}
                    placeholder="Ulangi kata sandi baru"
                    placeholderTextColor="#9aa3b5"
                    secureTextEntry
                    style={styles.pwInput}
                    value={confirmPass}
                  />
                  {pwMsg && (
                    <Text
                      style={[
                        styles.pwMsg,
                        { color: pwMsg.ok ? colors.green : colors.red },
                      ]}
                    >
                      {pwMsg.text}
                    </Text>
                  )}
                  <PlateButton
                    onPress={handleChangePassword}
                    variant="accent"
                    style={styles.pwBtn}
                  >
                    {pwBusy ? 'Menyimpan…' : 'Simpan Kata Sandi'}
                  </PlateButton>
                </View>
              )}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  hero: {
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.ink,
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
  profileCard: { marginTop: spacing.sm },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileText: { flex: 1, marginLeft: spacing.md },
  name: { color: '#ffffff', fontFamily: serifFamily('800'), fontSize: 28 },
  position: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily('500'),
    fontSize: 14,
    marginTop: 4,
  },
  empNo: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  outlineChip: {
    alignSelf: 'flex-start',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    borderWidth: 1.5,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  outlineChipText: {
    color: '#ffffff',
    fontFamily: fontFamily('700'),
    fontSize: 12,
    letterSpacing: 1,
  },
  contactDivider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  contactItem: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  contactText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily('500'),
    fontSize: 9,
    marginLeft: 6,
  },
  body: { paddingTop: spacing.md },
  kvWrap: { marginBottom: spacing.sm },
  /* Skeleton loading */
  skeletonCard: {
    backgroundColor: 'rgba(2,85,179,0.15)',
    borderRadius: 8,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  skeletonLine: {
    backgroundColor: 'rgba(2,85,179,0.25)',
    borderRadius: 4,
    height: 12,
    marginBottom: 8,
    width: '70%',
  },
  skeletonLineShort: {
    marginBottom: 0,
    width: '40%',
  },
  kvRow: { paddingHorizontal: spacing.md, paddingVertical: 10 },
  kvLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: fontFamily('500'), fontSize: 12 },
  kvValue: {
    color: '#ffffff',
    fontFamily: fontFamily('600'),
    fontSize: 14,
    marginTop: 3,
  },
  picWrap: { marginTop: spacing.sm },
  pwInput: {
    backgroundColor: '#f2f5fa',
    borderColor: '#d5dce8',
    borderRadius: 4,
    borderWidth: 1.5,
    color: colors.ink,
    fontFamily: fontFamily('500'),
    fontSize: 14,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pwMsg: {
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  pwBtn: { marginTop: spacing.md },
  pwNote: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.xs,
  },
  picInner: { padding: spacing.lg },
  sectionHead: { marginBottom: spacing.sm },
  cardTitle: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 15,
    marginBottom: 6,
  },
  ruleThick: { backgroundColor: 'rgba(255,255,255,0.25)', height: 3 },
  ruleThin: { backgroundColor: 'rgba(255,255,255,0.25)', height: 1, marginTop: 3 },
  picRow: { alignItems: 'center', flexDirection: 'row' },
  picText: { flex: 1, marginLeft: 12 },
  picName: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 14 },
  picPos: {
    color: 'rgba(255,255,255,0.75)',
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
