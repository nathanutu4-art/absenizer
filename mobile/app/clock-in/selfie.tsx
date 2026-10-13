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
import { AppIcon } from '../../src/components/AppIcon';
import { colors, fontFamily, spacing } from '../../src/theme';

/**
 * Ambil Selfie — layar gelap simulasi kamera (tanpa modul kamera native).
 * Panduan oval putus-putus + braket sudut + tombol shutter.
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <AppIcon color="#fff" name="chevron_left" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Ambil Selfie</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Viewfinder simulasi */}
        <View style={styles.viewfinder}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>KAMERA DEPAN</Text>
          </View>
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
        <View style={styles.simBox}>
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

        {/* Shutter */}
        <View style={styles.shutterRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleShutter}
            style={styles.shutterOuter}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#101018', flex: 1 },
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: '#1c2436',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: -3 },
  title: { color: '#fff', fontFamily: fontFamily('800'), fontSize: 17 },
  viewfinder: {
    alignItems: 'center',
    backgroundColor: '#1a2233',
    borderRadius: 26,
    height: 400,
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    top: 14,
  },
  tagText: {
    color: '#fff',
    fontFamily: fontFamily('700'),
    fontSize: 11,
    letterSpacing: 1,
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
  simBox: {
    backgroundColor: '#1c2436',
    borderRadius: 15,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  simRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simLabel: { color: '#fff', fontFamily: fontFamily('600'), fontSize: 13 },
  simHint: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 6,
  },
  shutterRow: { alignItems: 'center', marginTop: spacing.lg },
  shutterOuter: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 37,
    borderWidth: 4,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  shutterInner: {
    backgroundColor: '#fff',
    borderRadius: 27,
    height: 54,
    width: 54,
  },
});
