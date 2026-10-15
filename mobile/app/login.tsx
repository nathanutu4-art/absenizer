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
import { VideoView, useVideoPlayer } from 'expo-video';
import { AppIcon } from '../src/components/AppIcon';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { StampChip } from '../src/components/StampChip';
import { APP_VERSION, COMPANY_NAME } from '../src/data/demo';
import { supabase } from '../src/lib/supabase';
import { isSupabaseConfigured, resolveMyRole } from '../src/lib/db';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { showToast } from '../src/components/Toast';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

const ROLE_OPTIONS: { value: DemoRole; label: string }[] = [
  { value: 'karyawan', label: 'Karyawan' },
  { value: 'pic', label: 'PIC' },
  { value: 'hr', label: 'HR' },
];

/**
 * Login — glass liquid UI seperti dashboard: background abstrak indigo
 * blur, kartu kaca, teks putih. Logika auth & mode demo tidak berubah.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<DemoRole>('karyawan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video loop animasi
  const player = useVideoPlayer(
    'https://fzvphovffdhewpcjqjje.supabase.co/storage/v1/object/public/avatars/login-loop.mp4',
    (p: any) => {
      p.loop = true;
      p.muted = true;
      p.play();
    }
  );

  async function persistSession(
    userId: string,
    email: string | undefined,
    fallbackRole: DemoRole,
  ) {
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify({
        userId,
        email,
        role: fallbackRole,
        remember,
        demo: false,
      }),
    );
    if (isSupabaseConfigured()) {
      const resolvedRole = await resolveMyRole(fallbackRole);
      if (resolvedRole !== fallbackRole) {
        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify({
            userId,
            email,
            role: resolvedRole,
            remember,
            demo: false,
          }),
        );
      }
    }
    showToast('Selamat datang kembali!');
    router.replace('/(tabs)/home');
  }

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
      await persistSession(data.user.id, data.user.email, role);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal masuk. Periksa koneksi Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'prasta@gosit.us',
        password: 'Passbiasa1',
      });
      if (authError) throw authError;
      await persistSession(data.user.id, data.user.email, role);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Gagal masuk sebagai demo. Periksa koneksi Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.heroBody}>
            <MedallionIcon glyph="shield" size={60} variant="cream" />
            <Text style={styles.title}>Selamat Datang di Absenizer</Text>
            <Text style={styles.subtitle}>
              Masuk dengan email perusahaan Anda.
            </Text>
          </View>

          {/* Video loop tanpa border */}
          <VideoView
            player={player}
            contentFit="cover"
            nativeControls={false}
            style={styles.video}
          />

          {/* Form kaca */}
          <Plate glass style={styles.form}>
            <View style={styles.formInner}>
              <Text style={styles.label}>Email perusahaan</Text>
              <View style={styles.inputRow}>
                <AppIcon color="rgba(255,255,255,0.7)" name="mail" size={20} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="username"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                  value={email}
                />
              </View>

              <Text style={styles.label}>Kata sandi</Text>
              <View style={styles.inputRow}>
                <AppIcon color="rgba(255,255,255,0.7)" name="lock" size={20} style={styles.inputIcon} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.4)"
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
                        backgroundColor={active ? 'rgba(246,140,80,0.45)' : 'transparent'}
                        color="#ffffff"
                      >
                        {opt.label}
                      </StampChip>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PlateButton
                glass
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
                  {loading ? 'Memuat…' : 'Masuk sebagai Demo (prasta@gosit.us)'}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#0255b3', flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  heroBody: {
    alignItems: 'center',
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
  art: {
    alignSelf: 'center',
    borderRadius: 12,
    height: 150,
    marginTop: spacing.lg,
    width: '90%',
  },
  video: {
    alignSelf: 'center',
    borderRadius: 12,
    height: 200,
    marginTop: spacing.lg,
    width: '90%',
  },
  form: { marginTop: spacing.lg, width: '100%' },
  formInner: { padding: spacing.lg },
  label: {
    color: '#ffffff',
    fontFamily: fontFamily('700'),
    fontSize: 12.5,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(140,180,255,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    color: '#ffffff',
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
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxOn: { backgroundColor: 'rgba(246,140,80,0.6)' },
  rememberText: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginLeft: 8,
  },
  forgot: { color: '#f68c50', fontFamily: fontFamily('600'), fontSize: 13 },
  roleRow: { flexDirection: 'row', marginTop: 2 },
  roleChip: { marginRight: spacing.sm },
  error: {
    color: '#ff8a8a',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  loginBtn: { marginTop: spacing.lg },
  demoLinkWrap: { alignItems: 'center', marginTop: spacing.md },
  demoLink: {
    color: '#f68c50',
    fontFamily: fontFamily('600'),
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
