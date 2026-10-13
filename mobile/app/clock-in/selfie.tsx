import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { StampChip } from '../../src/components/StampChip';
import { colors, fontFamily, radius, serifFamily, spacing } from '../../src/theme';

/**
 * Ambil Selfie — layar gelap simulasi kamera (tanpa modul kamera native).
 * Panduan oval putus-putus + braket sudut + tombol shutter medali.
 */
export default function SelfieScreen() {
  const [simFace, setSimFace] = useState(false);

  function handleShutter() {
    router.push({
      pathname: '/clock-in/liveness',
      params: simFace ? { simFace: '1' } : {},
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
          <Text style={styles.title}>Ambil Selfie</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Viewfinder simulasi */}
        <View style={styles.viewfinder}>
          <StampChip
            backgroundColor="rgba(0,0,0,0.55)"
            color="#ffffff"
            style={styles.tag}
          >
            Kamera Depan
          </StampChip>
          {/* panduan oval wajah */}
          <View style={styles.oval} />
          {/* braket sudut */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <Text style={styles.hint}>
            Posisikan wajah di dalam oval
          </Text>
        </View>

        {/* Simulasi */}
        <Plate
          shadowColor="rgba(255,255,255,0.16)"
          style={styles.simPlate}
        >
          <View style={styles.simInner}>
            <View style={styles.simRow}>
              <Text style={styles.simLabel}>Simulasi: Wajah tidak cocok</Text>
              <Switch
                onValueChange={setSimFace}
                trackColor={{ false: '#3a4657', true: colors.orange }}
                value={simFace}
              />
            </View>
            <Text style={styles.simHint}>
              Untuk demo — hasil tetap diterima dengan penanda.
            </Text>
          </View>
        </Plate>

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
  simPlate: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  simInner: {
    backgroundColor: colors.darkSurface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  simRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simLabel: { color: '#ffffff', fontFamily: fontFamily('600'), fontSize: 13 },
  simHint: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 6,
  },
  shutterRow: { alignItems: 'center', marginTop: spacing.lg },
});
