import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import { colors, spacing, typography } from '../../src/theme';

type ClockKind = 'in' | 'out';

/**
 * Langkah 1 clock in/out: ambil foto selfie.
 *
 * TODO (dev build): expo-camera butuh dev build — tidak berfungsi penuh di
 * Expo Go. Pada perangkat fisik, minta izin kamera lalu tampilkan pratinjau.
 */
export default function SelfieScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const clockKind: ClockKind = kind === 'out' ? 'out' : 'in';
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ScreenContainer>
        <Text style={typography.body}>Memuat kamera…</Text>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <Text style={[typography.title, styles.heading]}>
          Izin Kamera Diperlukan
        </Text>
        <Text style={typography.body}>
          Absenizer membutuhkan akses kamera untuk mengambil foto selfie saat
          clock {clockKind === 'in' ? 'in' : 'out'}.
        </Text>
        <ThemedButton
          title="Berikan Izin Kamera"
          onPress={requestPermission}
          style={styles.button}
        />
      </ScreenContainer>
    );
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
      } else {
        // Fallback dev: tanpa foto nyata, lanjut dengan penanda.
        setPhotoUri('dev-placeholder');
      }
    } catch {
      setPhotoUri('dev-placeholder');
    }
  }

  function next() {
    router.push({
      pathname: '/clock-in/liveness',
      params: { kind: clockKind, selfieUri: photoUri ?? 'dev-placeholder' },
    });
  }

  return (
    <ScreenContainer scroll={false}>
      <Text style={[typography.title, styles.heading]}>
        Foto Selfie — Clock {clockKind === 'in' ? 'In' : 'Out'}
      </Text>
      <Text style={typography.body}>
        Posisikan wajah Anda di dalam bingkai, lalu ambil foto.
      </Text>
      <View style={styles.preview}>
        {photoUri && photoUri !== 'dev-placeholder' ? (
          <Text style={typography.body}>Foto diambil ✓</Text>
        ) : (
          <CameraView ref={cameraRef} facing="front" style={styles.camera} />
        )}
      </View>
      {photoUri ? (
        <ThemedButton title="Lanjut" onPress={next} style={styles.button} />
      ) : (
        <ThemedButton
          title="Ambil Foto"
          onPress={takePhoto}
          style={styles.button}
        />
      )}
      <ThemedButton
        title="Ambil Ulang"
        variant="outline"
        onPress={() => setPhotoUri(null)}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.md },
  camera: { flex: 1 },
  heading: { marginBottom: spacing.sm },
  preview: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    flex: 1,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
});
