import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { ThemedButton } from '../src/components/ThemedButton';
import { supabase } from '../src/lib/supabase';
import { colors, radius, spacing, typography } from '../src/theme';

const SESSION_KEY = 'absenizer_session';

/**
 * Login — BR-31: email perusahaan + kata sandi. Akun dibuatkan Admin HR;
 * tidak ada registrasi mandiri.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Simpan sesi secara aman di perangkat.
      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({ userId: data.user.id, email: data.user.email }),
      );
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Gagal masuk. Periksa koneksi Anda.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={typography.title}>Selamat Datang di Absenizer</Text>
        <Text style={[typography.body, { color: colors.inkSoft }]}>
          Masuk dengan email perusahaan Anda.
        </Text>
      </View>

      <Text style={styles.label}>Email perusahaan</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="nama@perusahaan.co.id"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={email}
      />

      <Text style={styles.label}>Kata sandi</Text>
      <TextInput
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={colors.muted}
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ThemedButton
        loading={loading}
        onPress={handleLogin}
        style={styles.button}
        title="Masuk"
      />
      <Text style={[typography.caption, styles.hint]}>
        Belum punya akun? Hubungi Admin HR — akun dibuatkan oleh HR.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.md },
  error: { color: colors.danger, marginTop: spacing.sm },
  header: { gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.xl },
  hint: { marginTop: spacing.md, textAlign: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  label: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs },
});
