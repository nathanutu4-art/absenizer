import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { StampChip } from '../src/components/StampChip';
import { ILLUSTRATION_OPENING } from '../src/data/illustrations-opening';
import { LOGO_MARK } from '../src/data/logo-mark';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/**
 * Opening — gaya glass dashboard: background abstrak indigo blur,
 * kartu kaca, teks putih. Alur ke /login tidak berubah.
 */
export default function OpeningScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <Image source={{ uri: LOGO_MARK }} style={styles.brandBadge} />
          <Text style={styles.brandText}>Absenizer</Text>
        </View>

        {/* Ilustrasi tanpa border */}
        <View style={styles.artWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: ILLUSTRATION_OPENING }}
            style={styles.art}
          />
        </View>

        {/* Konten dalam kartu kaca */}
        <Plate glass style={styles.sheet}>
          <View style={styles.sheetBody}>
            <StampChip
              backgroundColor="rgba(246,140,80,0.25)"
              color="#ffffff"
              style={styles.kicker}
            >
              Absensi Karyawan
            </StampChip>
            <Text style={styles.headline}>Absen Mudah dari Mana Saja</Text>
            <Text style={styles.sub}>
              Clock in dengan verifikasi wajah, pantau kehadiran tim, dan ajukan
              cuti — semua dalam satu aplikasi.
            </Text>
            <PlateButton
              glass
              onPress={() => router.push('/login')}
              style={styles.cta}
              variant="primary"
            >
              Masuk
            </PlateButton>
            <Text style={styles.footer}>© 2026 Prasta Corp. All rights reserved.</Text>
          </View>
        </Plate>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#0151b0', flex: 1 },
  safe: { flex: 1 },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  brandBadge: {
    borderRadius: 10,
    height: 44,
    width: 44,
  },
  brandText: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 22,
    marginLeft: 10,
  },
  artWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  frame: { width: '100%' },
  frameInner: { padding: 8 },
  art: {
    borderRadius: 12,
    height: 240,
    width: '100%',
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginTop: 'auto',
  },
  sheetBody: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3.5,
  },
  kicker: { marginBottom: spacing.sm },
  headline: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 30,
    lineHeight: 37,
    textShadowColor: 'rgba(77,127,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  cta: { marginTop: spacing.xl * 1.5 },
  footer: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 'auto',
    paddingTop: spacing.lg,
    textAlign: 'center',
  },
});
