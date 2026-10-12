import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import { colors, spacing, typography } from '../../src/theme';

/**
 * Langkah 2: tantangan kedip (liveness check) on-device — BR-36 (Q-04).
 * MVP memakai tantangan kedip sederhana via ML Kit face detection (gratis).
 * Liveness anti-spoofing kelas enterprise dinyatakan out of scope MVP.
 *
 * TODO (dev build): implementasikan deteksi kedip nyata dengan ML Kit
 * (expo-face-detector sudah tidak dipaket; pakai modul native ML Kit atau
 * react-native-vision-camera + frame processor). Saat ini disimulasikan
 * dengan tombol agar alur dapat diuji end-to-end.
 */
export default function LivenessScreen() {
  const { kind, selfieUri } = useLocalSearchParams<{
    kind?: string;
    selfieUri?: string;
  }>();
  const [blinked, setBlinked] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function next() {
    router.push({
      pathname: '/clock-in/confirm',
      params: { kind: kind ?? 'in', selfieUri: selfieUri ?? '' },
    });
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Tantangan Kedip</Text>
      <Text style={typography.body}>
        Untuk memastikan Anda hadir secara langsung, silakan{' '}
        <Text style={{ fontWeight: '700' }}>kedipkan mata dua kali</Text> ke
        arah kamera.
      </Text>

      <View style={styles.faceBox}>
        <Text style={styles.faceEmoji}>🙂</Text>
        <Text style={typography.caption}>
          {blinked ? 'Kedipan terdeteksi ✓' : `Menunggu kedipan… (${seconds}d)`}
        </Text>
      </View>

      {/* Tombol simulasi — ganti dengan deteksi ML Kit nyata pada dev build. */}
      {!blinked ? (
        <ThemedButton
          title="Simulasikan Kedipan Terdeteksi"
          variant="outline"
          onPress={() => setBlinked(true)}
          style={styles.button}
        />
      ) : (
        <ThemedButton title="Lanjut" onPress={next} style={styles.button} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.lg },
  faceBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 16,
    borderWidth: 2,
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.xl,
  },
  faceEmoji: { fontSize: 64 },
  heading: { marginBottom: spacing.sm },
});
