import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../src/components/AppIcon';
import { GradientView } from '../src/components/GradientView';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { StampChip } from '../src/components/StampChip';
import { APP_VERSION, COMPANY_NAME } from '../src/data/demo';
import { ILLUSTRATION_LOGIN } from '../src/data/illustrations-login';
import { HATCH_TILE } from '../src/data/medallions';
import { supabase } from '../src/lib/supabase';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { showToast } from '../src/components/Toast';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

const ROLE_OPTIONS: { value: DemoRole; label: string }[] = [
  { value: 'karyawan', label: 'Karyawan' },
  { value: 'pic', label: 'PIC' },
  { value: 'hr', label: 'HR' },
];

/**
 * Login — BR-31: email perusahaan + kata sandi. Akun dibuatkan Admin HR.
 * Hero ukiran + ilustrasi meja kantor berbingkai ganda, formulir di
 * atas plat kertas. Logika auth & mode demo tidak berubah.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('nadia.prameswari@perusahaan.co.id');
  const [password, setPassword] = useState('demo1234');
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<DemoRole>('karyawan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Masukkan email perusahaan dan kata sandi Anda.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          role,
          remember,
        }),
      );
      showToast('Selamat datang kembali!');
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal masuk. Periksa koneksi Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Mode demo untuk testing — HANYA untuk build uji coba, hapus sebelum produksi.
   * Melewati Supabase auth dan menyimpan sesi demo lokal sesuai peran terpilih.
   */
  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({
          demo: true,
          email: 'demo@perusahaan.co.id',
          userId: 'demo-user',
          role,
          remember,
        }),
      );
      showToast('Selamat datang kembali!');
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal masuk mode demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Hero ukiran */}
      <GradientView kind="hero" style={styles.hero}>
        <Image
          resizeMode="repeat"
          source={{ uri: HATCH_TILE }}
          style={[StyleSheet.absoluteFill, styles.hatch]}
        />
        <SafeAreaView edges={['top']} style={styles.safe}>
          <View style={styles.heroBody}>
            <MedallionIcon glyph="shield" size={60} variant="cream" />
            <Text style={styles.title}>Selamat Datang di AbsensiKu</Text>
            <Text style={styles.subtitle}>
              Masuk dengan email perusahaan Anda.
            </Text>
            <Plate style={styles.frame}>
              <View style={styles.frameInner}>
                <Image
                  resizeMode="cover"
                  source={{ uri: ILLUSTRATION_LOGIN }}
                  style={styles.art}
                />
              </View>
            </Plate>
          </View>
        </SafeAreaView>
      </GradientView>

      {/* Formulir di atas kertas */}
      <View style={styles.sheet}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
        >
          <Plate style={styles.form}>
            <View style={styles.formInner}>
              <Text style={styles.label}>Email perusahaan</Text>
              <View style={styles.inputRow}>
                <MedallionIcon glyph="mail" size={32} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="nama@perusahaan.co.id"
                  placeholderTextColor={colors.ink3}
                  style={styles.input}
                  value={email}
                />
              </View>

              <Text style={styles.label}>Kata sandi</Text>
              <View style={styles.inputRow}>
                <MedallionIcon glyph="lock" size={32} style={styles.inputIcon} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.ink3}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  onPress={() => setRemember(!remember)}
                  style={styles.rememberRow}
                >
                  <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                    {remember ? <AppIcon color="#fff" name="check" size={13} /> : null}
                  </View>
                  <Text style={styles.rememberText}>Ingat saya</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showToast('Hubungi Admin HR untuk reset kata sandi.')}>
                  <Text style={styles.forgot}>Lupa kata sandi?</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Masuk sebagai</Text>
              <View style={styles.roleRow}>
                {ROLE_OPTIONS.map((opt) => {
                  const active = role === opt.value;
                  return (
                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.85}
                      key={opt.value}
                      onPress={() => setRole(opt.value)}
                      style={styles.roleChip}
                    >
                      <StampChip
                        backgroundColor={active ? colors.ink : 'transparent'}
                        color={active ? colors.surface : colors.ink2}
                      >
                        {opt.label}
                      </StampChip>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PlateButton
                disabled={loading}
                onPress={handleLogin}
                style={styles.loginBtn}
                variant="primary"
              >
                {loading ? 'Memuat…' : 'Masuk'}
              </PlateButton>
              <TouchableOpacity
                disabled={loading}
                onPress={handleDemoLogin}
                style={styles.demoLinkWrap}
              >
                <Text style={styles.demoLink}>
                  {loading ? 'Memuat…' : 'Masuk sebagai Demo'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.hint}>
                Belum punya akun? Hubungi Admin HR — akun dibuatkan oleh HR.
              </Text>
            </View>
          </Plate>

          <Text style={styles.footer}>
            {COMPANY_NAME} • Versi {APP_VERSION}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.indigoDark, flex: 1 },
  hero: { flexShrink: 0 },
  hatch: { opacity: 0.07 },
  safe: { flexShrink: 0 },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 24,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  frame: { marginTop: spacing.md, width: '100%' },
  frameInner: { backgroundColor: colors.paper2, padding: 8 },
  art: {
    borderColor: colors.ink,
    borderRadius: 2,
    borderWidth: 2,
    height: 150,
    width: '100%',
  },
  sheet: { backgroundColor: colors.bg, flex: 1 },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  scrollView: { flex: 1 },
  scroll: { padding: spacing.lg },
  form: { width: '100%' },
  formInner: { padding: spacing.lg },
  label: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12.5,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: 3,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 8 },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 12,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  rememberRow: { alignItems: 'center', flexDirection: 'row' },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.ink,
    borderRadius: 2,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxOn: { backgroundColor: colors.ink },
  rememberText: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginLeft: 8,
  },
  forgot: { color: colors.indigo, fontFamily: fontFamily('600'), fontSize: 13 },
  roleRow: { flexDirection: 'row', marginTop: 2 },
  roleChip: { marginRight: spacing.sm },
  error: {
    color: colors.red,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  loginBtn: { marginTop: spacing.lg },
  demoLinkWrap: { alignItems: 'center', marginTop: spacing.md },
  demoLink: {
    color: colors.indigo,
    fontFamily: fontFamily('600'),
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  hint: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
