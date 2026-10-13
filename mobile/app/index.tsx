import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '../src/components/GradientView';
import { ILLUSTRATION_OPENING } from '../src/data/illustrations-opening';
import { LOGO_MARK } from '../src/data/logo-mark';
import { fontFamily, radius, spacing } from '../src/theme';

/**
 * Opening — editorial gelap yang artsy: ilustrasi ukiran vintage
 * (disamakan dengan gaya logo) di atas bingkai indigo, headline putih,
 * dan CTA putih. Palet tetap: navy/indigo/putih.
 */
export default function OpeningScreen() {
  return (
    <GradientView kind="hero" style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <Image source={{ uri: LOGO_MARK }} style={styles.brandBadge} />
          <Text style={styles.brandText}>AbsensiKu</Text>
        </View>

        {/* Ilustrasi ukiran */}
        <View style={styles.artWrap}>
          <Image
            resizeMode="cover"
            source={{ uri: ILLUSTRATION_OPENING }}
            style={styles.art}
          />
        </View>

        {/* Kop editorial */}
        <View style={styles.copy}>
          <Text style={styles.kicker}>Absensi Karyawan</Text>
          <Text style={styles.headline}>Absen Mudah dari Mana Saja</Text>
          <Text style={styles.sub}>
            Clock in dengan verifikasi wajah, pantau kehadiran tim, dan ajukan
            cuti — semua dalam satu aplikasi.
          </Text>
        </View>

        {/* CTA + indikator */}
        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => router.push('/login')}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Masuk →</Text>
          </TouchableOpacity>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
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
    borderRadius: 12,
    height: 40,
    width: 40,
  },
  brandText: {
    color: '#fff',
    fontFamily: fontFamily('800'),
    fontSize: 20,
    marginLeft: 10,
  },
  artWrap: {
    borderRadius: 28,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  art: { height: 300, width: '100%' },
  copy: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    color: '#b8b8ff',
    fontFamily: fontFamily('700'),
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headline: {
    color: '#fff',
    fontFamily: fontFamily('800'),
    fontSize: 32,
    lineHeight: 38,
    marginTop: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.button,
    justifyContent: 'center',
    minHeight: 56,
  },
  ctaText: { color: '#0057ba', fontFamily: fontFamily('700'), fontSize: 16 },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  dotActive: { backgroundColor: '#fff', width: 24 },
});
