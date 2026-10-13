import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { PlateButton } from '../../src/components/PlateButton';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

/**
 * Tantangan Kedip — layar gelap, ring progres + ilustrasi wajah berkedip.
 * "Saya Sudah Berkedip" menganimasikan arc lalu lanjut ke Konfirmasi GPS.
 */
export default function LivenessScreen() {
  const { simFace } = useLocalSearchParams<{ simFace?: string }>();
  const [busy, setBusy] = useState(false);
  const blink = useRef(new Animated.Value(0)).current;
  const arc = useRef(new Animated.Value(0)).current;

  // Kedip mata berulang.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(blink, {
          toValue: 1,
          duration: 140,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 0,
          duration: 140,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  const eyeScaleY = blink.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.08],
  });
  const arcRotate = arc.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  function handleDone() {
    if (busy) return;
    setBusy(true);
    Animated.timing(arc, {
      toValue: 1,
      duration: 950,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      router.push({
        pathname: '/clock-in/confirm',
        params: simFace ? { simFace: '1' } : {},
      });
      setBusy(false);
    });
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.back()}
          >
            <MedallionIcon glyph="chevron_left" size={36} variant="cream" />
          </TouchableOpacity>
          <Text style={styles.title}>Tantangan Kedip</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Langkah 2 dari 3 */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={styles.dot} />
        </View>

        <View style={styles.ringWrap}>
          <View style={styles.ringTrack} />
          <Animated.View
            style={[styles.ringArc, { transform: [{ rotate: arcRotate }] }]}
          />
          {/* Ilustrasi wajah */}
          <View style={styles.face}>
            <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]} />
            <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]} />
            <View style={styles.smile} />
          </View>
        </View>

        <Text style={styles.headline}>Kedipkan mata Anda</Text>
        <Text style={styles.sub}>
          Ikuti tantangan untuk memastikan Anda hadir secara langsung.
        </Text>

        <View style={styles.ctaWrap}>
          <PlateButton
            disabled={busy}
            onPress={handleDone}
            variant="primary"
          >
            {busy ? 'Memverifikasi…' : 'Saya Sudah Berkedip'}
          </PlateButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const RING = 228;

const styles = StyleSheet.create({
  root: { backgroundColor: colors.darkBg, flex: 1 },
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerSpacer: { height: 36, width: 36 },
  title: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 18,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  dot: {
    backgroundColor: '#2a3448',
    borderRadius: 5,
    height: 10,
    marginHorizontal: 5,
    width: 10,
  },
  dotDone: { backgroundColor: colors.indigoBright },
  ringWrap: {
    alignItems: 'center',
    height: RING,
    justifyContent: 'center',
    marginTop: spacing.xl,
    alignSelf: 'center',
    width: RING,
  },
  ringTrack: {
    borderColor: '#2a3448',
    borderRadius: RING / 2,
    borderWidth: 10,
    height: RING,
    position: 'absolute',
    width: RING,
  },
  ringArc: {
    borderBottomColor: 'transparent',
    borderColor: colors.indigoBright,
    borderLeftColor: 'transparent',
    borderRadius: RING / 2,
    borderRightColor: 'transparent',
    borderWidth: 10,
    height: RING,
    position: 'absolute',
    width: RING,
  },
  face: {
    alignItems: 'center',
    backgroundColor: colors.paper2,
    borderRadius: 106,
    flexDirection: 'row',
    height: 212,
    justifyContent: 'center',
    width: 212,
  },
  eye: {
    backgroundColor: colors.etch,
    borderRadius: 11,
    height: 22,
    marginHorizontal: 22,
    width: 22,
  },
  smile: {
    borderBottomColor: colors.etch,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRadius: 40,
    borderRightColor: 'transparent',
    borderTopWidth: 0,
    bottom: 52,
    height: 40,
    position: 'absolute',
    width: 80,
  },
  headline: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 22,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: fontFamily('400'),
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
  },
  ctaWrap: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
