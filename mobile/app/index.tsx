import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { colors, fontFamily, radius, spacing } from '../src/theme';

/**
 * Opening — hero gradasi biru + ilustrasi pekerja (bentuk sederhana) +
 * bottom sheet putih berisi headline dan CTA "Masuk".
 */
export default function OpeningScreen() {
  return (
    <GradientView kind="hero" style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>A</Text>
          </View>
          <Text style={styles.brandText}>AbsensiKu</Text>
        </View>

        {/* Ilustrasi pekerja kantor — bentuk geometris sederhana */}
        <View style={styles.illustration}>
          <View style={styles.sun} />
          <View style={styles.buildingA} />
          <View style={styles.buildingB} />
          {/* pekerja */}
          <View style={styles.person}>
            <View style={styles.head} />
            <View style={styles.body} />
            <View style={styles.armLeft} />
            <View style={styles.armRight} />
          </View>
          {/* meja + laptop */}
          <View style={styles.desk} />
          <View style={styles.laptopScreen} />
          <View style={styles.laptopBase} />
          {/* dokumen melayang */}
          <View style={styles.docOne} />
          <View style={styles.docTwo} />
        </View>

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.headline}>Absen Mudah dari Mana Saja</Text>
          <Text style={styles.sub}>
            Clock in dengan verifikasi wajah, pantau kehadiran tim, dan ajukan
            cuti — semua dalam satu aplikasi.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => router.push('/login')}
          >
            <GradientView
              imageStyle={{ borderRadius: radius.button }}
              kind="primary"
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Masuk →</Text>
            </GradientView>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  brandBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brandBadgeText: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 20 },
  brandText: {
    color: '#fff',
    fontFamily: fontFamily('800'),
    fontSize: 20,
    marginLeft: 10,
  },
  illustration: { flex: 1, marginHorizontal: spacing.lg },
  sun: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 30,
    height: 60,
    position: 'absolute',
    right: 24,
    top: 8,
    width: 60,
  },
  buildingA: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    bottom: 0,
    height: 150,
    left: 8,
    position: 'absolute',
    width: 74,
  },
  buildingB: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    bottom: 0,
    height: 110,
    position: 'absolute',
    right: 8,
    width: 60,
  },
  person: { bottom: 34, left: '38%', position: 'absolute' },
  head: {
    backgroundColor: '#ffd9b3',
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  body: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 74,
    marginTop: -6,
    width: 64,
  },
  armLeft: {
    backgroundColor: '#e8eef5',
    borderRadius: 10,
    height: 52,
    left: -14,
    position: 'absolute',
    top: 48,
    transform: [{ rotate: '18deg' }],
    width: 20,
  },
  armRight: {
    backgroundColor: '#e8eef5',
    borderRadius: 10,
    height: 52,
    position: 'absolute',
    right: -14,
    top: 48,
    transform: [{ rotate: '-18deg' }],
    width: 20,
  },
  desk: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    bottom: 22,
    height: 14,
    left: '10%',
    position: 'absolute',
    width: '80%',
  },
  laptopScreen: {
    backgroundColor: '#223140',
    borderRadius: 6,
    bottom: 36,
    height: 44,
    left: '22%',
    position: 'absolute',
    width: 66,
  },
  laptopBase: {
    backgroundColor: '#5c7287',
    borderRadius: 4,
    bottom: 30,
    height: 8,
    left: '18%',
    position: 'absolute',
    width: 86,
  },
  docOne: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    height: 40,
    position: 'absolute',
    right: '30%',
    top: 60,
    transform: [{ rotate: '10deg' }],
    width: 30,
  },
  docTwo: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    height: 34,
    left: '20%',
    position: 'absolute',
    top: 96,
    transform: [{ rotate: '-12deg' }],
    width: 26,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    backgroundColor: colors.line,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  dotActive: { backgroundColor: colors.indigo, width: 24 },
  headline: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 25,
    textAlign: 'center',
  },
  sub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  cta: {
    alignItems: 'center',
    borderRadius: radius.button,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 54,
  },
  ctaText: { color: '#fff', fontFamily: fontFamily('700'), fontSize: 16 },
});
