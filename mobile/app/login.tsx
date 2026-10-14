import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { ILLUSTRATION_LOGIN } from '../src/data/illustrations-login';
import { HATCH_TILE } from '../src/data/medallions';
import { showToast } from '../src/components/Toast';
import { SESSION_KEY, type DemoRole } from '../src/lib/session';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/** Uji: struktur lengkap + tombol bypass demo. */
export default function LoginScreen() {
  const [role, setRole] = useState<DemoRole>('karyawan');
  const [loading, setLoading] = useState(false);

  async function handleDemoLogin() {
    setLoading(true);
    try {
      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({
          demo: true,
          email: 'demo@perusahaan.co.id',
          userId: 'demo-user',
          role,
          remember: true,
        }),
      );
      showToast('Selamat datang kembali!');
      router.replace('/(tabs)/home');
    } catch (e) {
      showToast('Gagal masuk mode demo.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.root}>
      <GradientView kind="hero" style={styles.hero}>
        <Image
          resizeMode="repeat"
          source={{ uri: HATCH_TILE }}
          style={[StyleSheet.absoluteFill, styles.hatch]}
        />
        <SafeAreaView edges={['top']} style={styles.safe}>
          <View style={styles.heroBody}>
            <MedallionIcon glyph="shield" size={60} variant="wadaIndigo" />
            <Text style={styles.title}>Selamat Datang di Absenizer</Text>
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
              <Text style={styles.label}>Konten form di sini</Text>
              <Text style={styles.hint}>Jika struktur lengkap tampil, layout aman.</Text>
              <PlateButton
                disabled={loading}
                onPress={() => {}}
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
            </View>
          </Plate>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { borderColor: colors.ink, borderRadius: 2, borderWidth: 2, height: 150, width: '100%' },
  form: { width: '100%' },
  formInner: { padding: spacing.lg },
  frame: { marginTop: spacing.md, width: '100%' },
  frameInner: { backgroundColor: colors.paper2, padding: 8 },
  hatch: { opacity: 0.07 },
  hero: { flexShrink: 0 },
  heroBody: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  hint: { color: colors.ink3, fontFamily: fontFamily('400'), fontSize: 12, marginTop: 8, textAlign: 'center' },
  label: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 12.5, marginBottom: 6 },
  loginBtn: { marginTop: spacing.lg },
  demoLink: {
    color: colors.indigo,
    fontFamily: fontFamily('600'),
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  demoLinkWrap: { alignItems: 'center', marginTop: spacing.md },
  root: { backgroundColor: colors.indigoDark, flex: 1 },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  safe: { flexShrink: 0 },
  scroll: { padding: spacing.lg },
  scrollView: { flex: 1 },
  sheet: { backgroundColor: colors.bg, flex: 1 },
  title: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 24,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
