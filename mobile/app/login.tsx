import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { ILLUSTRATION_LOGIN } from '../src/data/illustrations-login';
import { HATCH_TILE } from '../src/data/medallions';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/** Uji: struktur lengkap hero + scroll (konten minimal). */
export default function LoginScreen() {
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
