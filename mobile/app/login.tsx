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
import { PlateButton } from '../src/components/PlateButton';
import { supabase } from '../src/lib/supabase';
import { isSupabaseConfigured, resolveMyRole } from '../src/lib/db';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { showToast } from '../src/components/Toast';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/**
 * Login — glass liquid UI seperti dashboard: background abstrak indigo
 * blur, kartu kaca, teks putih. Logika auth & mode demo tidak berubah.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
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

  /**
   * Simpan sesi login ke SecureStore lalu navigasi ke Beranda.
   * Role awal 'karyawan'; bila Supabase terkonfigurasi, role diselesaikan
   * ulang dari database lewat resolveMyRole dan sesi ditulis ulang bila beda.
   */
  async function persistSession(userId: string, email: string | undefined) {
    // Role murni dari database; default 'karyawan' bila tidak terkonfigurasi.
    const defaultRole: DemoRole = 'karyawan';
    await SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify({
        userId,
        email,
        role: defaultRole,
        remember,
        demo: false,
      }),
    );
    if (isSupabaseConfigured()) {
      const resolvedRole = await resolveMyRole(defaultRole);
      if (resolvedRole !== defaultRole) {
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

  /** Terjemahkan error auth umum ke bahasa Indonesia. */
  function mapAuthError(e: unknown): string {
    if (!(e instanceof Error)) return 'Gagal masuk. Periksa koneksi Anda.';
    const msg = e.message.toLowerCase();
    if (msg.includes('invalid login credentials'))
      return 'Email atau kata sandi salah.';
    if (msg.includes('email not confirmed'))
      return 'Email belum dikonfirmasi. Hubungi HR.';
    if (msg.includes('network') || msg.includes('fetch'))
      return 'Tidak ada koneksi internet.';
    return 'Gagal masuk. Periksa koneksi Anda.';
  }

  /**
   * Handler tombol Masuk: validasi email & kata sandi, autentikasi via
   * Supabase Auth (signInWithPassword), lalu persistSession; error
   * ditampilkan dalam Bahasa Indonesia lewat mapAuthError.
   */
  async function handleLogin() {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Masukkan email perusahaan dan kata sandi Anda.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Format email tidak valid.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (authError) throw authError;
      await persistSession(data.user.id, data.user.email);
    } catch (e) {
      setError(mapAuthError(e));
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

          {/* Form putih */}
          <View style={[styles.form, styles.whiteForm]}>
            <View style={styles.formInner}>
              <Text style={styles.label}>Email perusahaan</Text>
              <View style={styles.inputRow}>
                <AppIcon color="#8a94a8" name="mail" size={20} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="username"
                  placeholderTextColor="#9aa3b5"
                  style={styles.input}
                  value={email}
                />
              </View>

              <Text style={styles.label}>Kata sandi</Text>
              <View style={styles.inputRow}>
                <AppIcon color="#8a94a8" name="lock" size={20} style={styles.inputIcon} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9aa3b5"
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

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PlateButton
                disabled={loading}
                onPress={handleLogin}
                style={styles.loginBtn}
                variant="accent"
              >
                {loading ? 'Memuat…' : 'Masuk'}
              </PlateButton>
              <Text style={styles.hint}>
                Belum punya akun? Hubungi Admin HR — akun dibuatkan oleh HR.
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            © 2026 Prasta Corp. All rights reserved.
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
  whiteForm: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
  },
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
    backgroundColor: '#f2f5fa',
    borderColor: '#d5dce8',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
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
    borderColor: '#b9c2d4',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxOn: { backgroundColor: 'rgba(246,140,80,0.6)' },
  rememberText: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginLeft: 8,
  },
  forgot: { color: '#f68c50', fontFamily: fontFamily('600'), fontSize: 13 },
  error: {
    color: '#ff8a8a',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  loginBtn: { marginTop: spacing.lg },
  hint: {
    color: colors.ink3,
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
