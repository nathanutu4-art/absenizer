import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { ThemedButton } from '../src/components/ThemedButton';
import { APP_VERSION, COMPANY_NAME } from '../src/data/demo';
import { supabase } from '../src/lib/supabase';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { showToast } from '../src/components/Toast';
import { colors, fontFamily, radius, spacing } from '../src/theme';

/**
 * Login — BR-31: email perusahaan + kata sandi. Akun dibuatkan Admin HR.
 * Hero gradasi + ilustrasi meja kantor (bentuk sederhana).
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
    <GradientView kind="hero" style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ilustrasi meja kantor sederhana */}
          <View style={styles.illustration}>
            <View style={styles.window} />
            <View style={styles.deskTop} />
            <View style={styles.monitor} />
            <View style={styles.monitorStand} />
            <View style={styles.keyboard} />
            <View style={styles.mug} />
            <View style={styles.plant} />
            <View style={styles.plantPot} />
          </View>

          <Text style={styles.title}>Selamat Datang di AbsensiKu</Text>
          <Text style={styles.subtitle}>
            Masuk dengan email perusahaan Anda.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email perusahaan</Text>
            <View style={styles.inputRow}>
              <Text style={styles.icon}>✉️</Text>
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
              <Text style={styles.icon}>🔒</Text>
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
                  {remember ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberText}>Ingat saya</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showToast('Hubungi Admin HR untuk reset kata sandi.')}>
                <Text style={styles.forgot}>Lupa kata sandi?</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Masuk sebagai</Text>
            <SegmentedControl<DemoRole>
              onChange={setRole}
              options={[
                { value: 'karyawan', label: 'Karyawan' },
                { value: 'pic', label: 'PIC' },
                { value: 'hr', label: 'HR' },
              ]}
              value={role}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <ThemedButton
              loading={loading}
              onPress={handleLogin}
              style={styles.loginBtn}
              title="Masuk"
            />
            <ThemedButton
              loading={loading}
              onPress={handleDemoLogin}
              style={styles.demoBtn}
              title="Masuk sebagai Demo"
              variant="outline"
            />
            <Text style={styles.hint}>
              Belum punya akun? Hubungi Admin HR — akun dibuatkan oleh HR.
            </Text>
          </View>

          <Text style={styles.footer}>
            {COMPANY_NAME} • Versi {APP_VERSION}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  illustration: { height: 130, marginBottom: spacing.sm },
  window: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    height: 90,
    left: 10,
    position: 'absolute',
    top: 0,
    width: 110,
  },
  deskTop: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    bottom: 18,
    height: 12,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  monitor: {
    backgroundColor: '#223140',
    borderRadius: 8,
    bottom: 30,
    height: 56,
    left: '30%',
    position: 'absolute',
    width: 84,
  },
  monitorStand: {
    backgroundColor: '#5c7287',
    bottom: 22,
    height: 10,
    left: '42%',
    position: 'absolute',
    width: 12,
  },
  keyboard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 5,
    bottom: 32,
    height: 10,
    left: '8%',
    position: 'absolute',
    width: 70,
  },
  mug: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    bottom: 32,
    height: 26,
    position: 'absolute',
    right: '22%',
    width: 22,
  },
  plant: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    bottom: 44,
    height: 32,
    position: 'absolute',
    right: '6%',
    width: 32,
  },
  plantPot: {
    backgroundColor: '#ea580c',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    bottom: 30,
    height: 18,
    position: 'absolute',
    right: '8%',
    width: 28,
  },
  title: {
    color: '#fff',
    fontFamily: fontFamily('800'),
    fontSize: 27,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  label: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12.5,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  inputRow: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  icon: { fontSize: 16, marginRight: 8 },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 13,
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
    borderColor: colors.line,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxOn: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rememberText: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginLeft: 8,
  },
  forgot: { color: colors.indigo, fontFamily: fontFamily('600'), fontSize: 13 },
  error: {
    color: colors.red,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  loginBtn: { marginTop: spacing.lg },
  demoBtn: { marginTop: spacing.sm },
  hint: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
