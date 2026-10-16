import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { StampChip } from '../../src/components/StampChip';
import { setSelfiePhoto } from '../../src/lib/selfiePhoto';
import { colors, fontFamily, radius, serifFamily, spacing } from '../../src/theme';

/**
 * Ambil Selfie — pratinjau kamera depan asli (expo-camera).
 * Tombol shutter mengambil foto sungguhan lalu lanjut ke konfirmasi GPS.
 * Tidak ada verifikasi wajah: clock-in/out hanya foto + lokasi.
 */
export default function SelfieScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const isOut = kind === 'out';
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleShutter() {
    if (busy) return;
    setBusy(true);
    try {
      if (cameraRef.current && permission?.granted) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          shutterSound: false,
        });
        if (photo?.uri) setSelfiePhoto(photo.uri);
      }
    } catch {
      // Gagal ambil foto — lanjutkan alur demo.
    } finally {
      setBusy(false);
    }
    router.push({
      pathname: '/clock-in/confirm',
      params: isOut ? { kind: 'out' } : {},
    });
  }

  const camReady = permission?.granted === true;

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
          <Text style={styles.title}>Ambil Selfie</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Viewfinder kamera asli */}
        <View style={styles.viewfinder}>
          {camReady ? (
            <CameraView
              facing="front"
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.noCam]}>
              <Text style={styles.noCamText}>
                {permission && !permission.canAskAgain
                  ? 'Izin kamera ditolak.\nAktifkan di Pengaturan HP.'
                  : 'Meminta izin kamera…'}
              </Text>
              {permission && !permission.granted && permission.canAskAgain && (
                <TouchableOpacity onPress={() => requestPermission()}>
                  <Text style={styles.noCamRetry}>Minta Izin Lagi</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <StampChip
            backgroundColor="rgba(0,0,0,0.55)"
            color="#ffffff"
            style={styles.tag}
          >
            Kamera Depan
          </StampChip>
          {/* panduan oval wajah */}
          <View style={styles.oval} pointerEvents="none" />
          {/* braket sudut */}
          <View style={[styles.corner, styles.tl]} pointerEvents="none" />
          <View style={[styles.corner, styles.tr]} pointerEvents="none" />
          <View style={[styles.corner, styles.bl]} pointerEvents="none" />
          <View style={[styles.corner, styles.br]} pointerEvents="none" />
          <Text style={styles.hint} pointerEvents="none">
            Posisikan wajah di dalam oval
          </Text>
        </View>

        {/* Shutter */}
        <View style={styles.shutterRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleShutter}
          >
            <MedallionIcon glyph="check" size={72} variant="cream" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

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
  viewfinder: {
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderColor: colors.etch,
    borderRadius: radius.card,
    borderWidth: 1.5,
    height: 400,
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  tag: {
    left: 14,
    position: 'absolute',
    top: 14,
  },
  noCam: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  noCamText: {
    color: '#ffffff',
    fontFamily: fontFamily('600'),
    fontSize: 14,
    textAlign: 'center',
  },
  noCamRetry: {
    color: colors.wadaApricot,
    fontFamily: fontFamily('700'),
    fontSize: 14,
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  oval: {
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: 98,
    borderStyle: 'dashed',
    borderWidth: 2.5,
    height: 252,
    width: 196,
  },
  corner: {
    borderColor: colors.indigoBright,
    height: 34,
    position: 'absolute',
    width: 34,
  },
  tl: { borderLeftWidth: 4, borderTopWidth: 4, left: 18, top: 18 },
  tr: { borderRightWidth: 4, borderTopWidth: 4, right: 18, top: 18 },
  bl: { borderLeftWidth: 4, borderBottomWidth: 4, bottom: 18, left: 18 },
  br: { borderRightWidth: 4, borderBottomWidth: 4, bottom: 18, right: 18 },
  hint: {
    bottom: 22,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    position: 'absolute',
  },
  shutterRow: { alignItems: 'center', marginTop: spacing.lg },
});
