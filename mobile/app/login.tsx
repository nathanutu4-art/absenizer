import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { MedallionIcon } from '../src/components/MedallionIcon';
import { Plate } from '../src/components/Plate';
import { ILLUSTRATION_LOGIN } from '../src/data/illustrations-login';
import { HATCH_TILE } from '../src/data/medallions';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/** Uji: hero login lengkap (tanpa form). */
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
      <Text style={styles.test}>Jika hero tampil, bagian atas aman.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    borderColor: colors.ink,
    borderRadius: 2,
    borderWidth: 2,
    height: 150,
    width: '100%',
  },
  frame: { marginTop: spacing.md, width: '100%' },
  frameInner: { backgroundColor: colors.paper2, padding: 8 },
  hatch: { opacity: 0.07 },
  hero: { flexShrink: 0 },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  root: { backgroundColor: colors.indigoDark, flex: 1 },
  safe: { flexShrink: 0 },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  test: { color: '#5a5245', fontSize: 14, marginTop: 16, textAlign: 'center' },
  title: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 24,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
