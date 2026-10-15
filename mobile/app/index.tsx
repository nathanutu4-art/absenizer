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

        {/* Ilustrasi dalam kartu kaca */}
        <View style={styles.artWrap}>
          <Plate glass style={styles.frame}>
            <View style={styles.frameInner}>
              <Image
                resizeMode="cover"
                source={{ uri: ILLUSTRATION_OPENING }}
                style={styles.art}
              />
            </View>
          </Plate>
        </View>

        {/* Konten dalam kartu kaca */}
        <Plate glass style={styles.sheet}>
          <View style={styles.sheetBody}>
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
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
              onPress={() => router.push('/login')}
              style={styles.cta}
              variant="primary"
            >
              Masuk
            </PlateButton>
          </View>
        </Plate>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
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
    color: '#051230',
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
    borderColor: 'rgba(140,180,255,0.3)',
    borderRadius: 12,
    borderWidth: 1,
    height: 240,
    width: '100%',
  },
  sheet: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  sheetBody: {
    padding: spacing.lg,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dot: {
    backgroundColor: '#cccccc',
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  dotActive: { backgroundColor: '#051230', width: 24 },
  kicker: { marginBottom: spacing.sm },
  headline: {
    color: '#051230',
    fontFamily: serifFamily('800'),
    fontSize: 30,
    lineHeight: 37,
    textShadowColor: 'rgba(77,127,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sub: {
    color: '#333333',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  cta: { marginTop: spacing.lg },
});
