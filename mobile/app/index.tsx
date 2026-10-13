import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { Plate } from '../src/components/Plate';
import { PlateButton } from '../src/components/PlateButton';
import { StampChip } from '../src/components/StampChip';
import { ILLUSTRATION_OPENING } from '../src/data/illustrations-opening';
import { LOGO_MARK } from '../src/data/logo-mark';
import { HATCH_TILE, SUNBURST_INK } from '../src/data/medallions';
import { colors, fontFamily, serifFamily, spacing } from '../src/theme';

/**
 * Opening — hero indigo bergaya ukiran vintage: sunburst di belakang
 * ilustrasi berbingkai ganda, lalu lembar kertas dengan headline serif
 * dan tombol cap. Reskin visual; alur ke /login tidak berubah.
 */
export default function OpeningScreen() {
  return (
    <View style={styles.root}>
      {/* Hero indigo */}
      <GradientView kind="hero" style={styles.hero}>
        <Image
          resizeMode="repeat"
          source={{ uri: HATCH_TILE }}
          style={[StyleSheet.absoluteFill, styles.hatch]}
        />
        <SafeAreaView edges={['top']} style={styles.safe}>
          {/* Brand */}
          <View style={styles.brandRow}>
            <Image source={{ uri: LOGO_MARK }} style={styles.brandBadge} />
            <Text style={styles.brandText}>Absenizer</Text>
          </View>

          {/* Ilustrasi ukiran berbingkai ganda di atas sunburst */}
          <View style={styles.artWrap}>
            <Image source={{ uri: SUNBURST_INK }} style={styles.sunburst} />
            <Plate style={styles.frame}>
              <View style={styles.frameInner}>
                <Image
                  resizeMode="cover"
                  source={{ uri: ILLUSTRATION_OPENING }}
                  style={styles.art}
                />
              </View>
            </Plate>
          </View>
        </SafeAreaView>
      </GradientView>

      {/* Lembar kertas */}
      <View style={styles.sheet}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
        <SafeAreaView edges={['bottom']}>
          <View style={styles.sheetBody}>
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <StampChip
              backgroundColor={colors.plate}
              color={colors.wadaApricot}
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
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.indigoDark, flex: 1 },
  hero: { flex: 1 },
  hatch: { opacity: 0.07 },
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
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  sunburst: {
    alignSelf: 'center',
    height: 380,
    opacity: 0.9,
    position: 'absolute',
    width: 380,
  },
  frame: { width: '100%' },
  frameInner: { backgroundColor: colors.paper2, padding: 8 },
  art: {
    borderColor: colors.ink,
    borderRadius: 2,
    borderWidth: 2,
    height: 250,
    width: '100%',
  },
  sheet: { backgroundColor: colors.bg },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  sheetBody: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dot: {
    backgroundColor: colors.line,
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  dotActive: { backgroundColor: colors.ink, width: 24 },
  kicker: { marginBottom: spacing.sm },
  headline: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 30,
    lineHeight: 37,
  },
  sub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  cta: { marginTop: spacing.lg },
});
