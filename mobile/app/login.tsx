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
import { AppIcon } from '../src/components/AppIcon';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { StampChip } from '../src/components/StampChip';
import { APP_VERSION, COMPANY_NAME } from '../src/data/demo';
import { showToast } from '../src/components/Toast';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { colors, fontFamily, spacing } from '../src/theme';

const ROLE_OPTIONS: { value: DemoRole; label: string }[] = [
  { value: 'karyawan', label: 'Karyawan' },
  { value: 'pic', label: 'PIC' },
  { value: 'hr', label: 'HR' },
];

/** Uji: form bawah login asli (tanpa hero). */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<DemoRole>('karyawan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Text style={styles.test}>Uji Form Bawah</Text>
        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
          >
            <Plate style={styles.form}>
              <View style={styles.formInner}>
                <Text style={styles.label}>Email perusahaan</Text>
                <View style={styles.inputRow}>
                  <MedallionIcon glyph="mail" size={32} style={styles.inputIcon} variant="wadaIndigo" />
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="username"
                    placeholderTextColor={colors.ink3}
                    style={styles.input}
                    value={email}
                  />
                </View>

                <Text style={styles.label}>Kata sandi</Text>
                <View style={styles.inputRow}>
                  <MedallionIcon glyph="lock" size={32} style={styles.inputIcon} variant="wadaIndigo" />
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
                  onPress={() => setError('Uji: tombol ditekan')}
                  style={styles.loginBtn}
                  variant="primary"
                >
                  {loading ? 'Memuat…' : 'Masuk'}
                </PlateButton>
                <Text style={styles.hint}>
                  Belum punya akun? Hubungi Admin HR — akun dibuatkan oleh HR.
                </Text>
              </View>
            </Plate>

            <Text style={styles.footer}>
              {COMPANY_NAME} • Versi {APP_VERSION}
            </Text>
            <Text style={styles.test2}>SESSION_KEY: {SESSION_KEY}</Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  error: {
    color: colors.red,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: spacing.sm,
  },
  footer: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  forgot: { color: colors.indigo, fontFamily: fontFamily('600'), fontSize: 13 },
  form: { width: '100%' },
  formInner: { padding: spacing.lg },
  hint: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 12,
  },
  inputIcon: { marginRight: 8 },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: 3,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  label: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12.5,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  loginBtn: { marginTop: spacing.lg },
  rememberRow: { alignItems: 'center', flexDirection: 'row' },
  rememberText: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginLeft: 8,
  },
  roleChip: { marginRight: spacing.sm },
  roleRow: { flexDirection: 'row', marginTop: 2 },
  root: { backgroundColor: colors.bg, flex: 1 },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  scrollView: { flex: 1 },
  sheet: { backgroundColor: colors.bg, flex: 1 },
  test: { color: colors.ink, fontSize: 18, fontWeight: '700', padding: 16, textAlign: 'center' },
  test2: { color: colors.ink3, fontSize: 10, marginTop: 8, textAlign: 'center' },
});
