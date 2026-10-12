import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { ThemedButton } from '../src/components/ThemedButton';
import { colors, radius, spacing, typography } from '../src/theme';

/**
 * Layar pembuka (onboarding) — layar pertama aplikasi.
 * Tombol "Masuk" mengarah ke layar login.
 */
export default function OpeningScreen() {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.hero}>
        {/* TODO (Fase 1): ganti kotak ini dengan ilustrasi SVG suasana kantor
            sesuai desain hi-fi (jam dinding, laptop, dokumen, tanaman). */}
        <View style={styles.illustrationPlaceholder}>
          <Text style={styles.illustrationText}>Ilustrasi Kantor</Text>
        </View>
      </View>
      <View style={styles.sheet}>
        <Text style={typography.title}>Absen Mudah dari Mana Saja</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Clock in dan clock out dengan selfie dan lokasi. Ajukan cuti, ijin,
          dan sakit langsung dari ponsel Anda.
        </Text>
        <ThemedButton title="Masuk" onPress={() => router.push('/login')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 3,
    justifyContent: 'center',
    margin: -spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  illustrationPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 220,
    justifyContent: 'center',
    width: '85%',
  },
  illustrationText: { color: colors.primary, fontWeight: '700' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    flex: 2,
    gap: spacing.md,
    marginHorizontal: -spacing.md,
    marginBottom: -spacing.xl,
    padding: spacing.lg,
  },
  subtitle: { color: colors.inkSoft },
});
