import { router, useLocalSearchParams } from 'expo-router';
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
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import {
  GEOFENCE_M,
  OFFICE_ADDRESS,
  OFFICE_NAME,
} from '../../src/data/demo';
import { recordClockIn } from '../../src/lib/clockState';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

/**
 * Konfirmasi GPS — peta simulasi (styled view): pin kantor + pin pengguna +
 * lingkaran geofence putus-putus. Di luar area TETAP DITERIMA + penanda oranye.
 */
export default function ConfirmScreen() {
  const { simFace } = useLocalSearchParams<{ simFace?: string }>();
  const [simFar, setSimFar] = useState(false);

  const distanceLabel = simFar ? '1,4 km' : '120 m';
  const areaLabel = simFar ? 'Di Luar Area' : 'Di Dalam Area';

  function handleConfirm() {
    const now = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    })
      .format(new Date())
      .replace(':', '.');
    const flags: string[] = [];
    if (simFace) flags.push('Wajah Tidak Cocok');
    if (simFar) flags.push('Di Luar Area');
    recordClockIn(now, flags);
    router.push({
      pathname: '/clock-in/success',
      params: {
        time: now,
        distance: distanceLabel,
        ...(simFace ? { simFace: '1' } : {}),
        ...(simFar ? { simFar: '1' } : {}),
      },
    });
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <AppIcon color={colors.ink} name="chevron_left" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Konfirmasi GPS</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Peta simulasi */}
        <View style={styles.mapBox}>
          {/* lingkaran geofence */}
          <View style={styles.geofence} />
          {/* pin kantor */}
          <View style={styles.officePin}>
            <AppIcon color={colors.indigo} name="building" size={24} />
          </View>
          {/* pin pengguna */}
          <View style={[styles.userPin, simFar && styles.userPinFar]}>
            <View style={styles.userDot} />
          </View>
          <View style={styles.gpsChip}>
            <AppIcon color={colors.indigo} name="navigation" size={14} style={styles.gpsChipIcon} />
            <Text style={styles.gpsChipText}>GPS Akurat • ± 8 m</Text>
          </View>
        </View>

        {/* Statistik jarak */}
        <View style={styles.stats}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{distanceLabel}</Text>
            <Text style={styles.statLabel}>Jarak ke kantor</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text
              style={[
                styles.statValue,
                simFar ? { color: colors.orange } : { color: colors.green },
              ]}
            >
              {areaLabel}
            </Text>
            <Text style={styles.statLabel}>Status area</Text>
          </View>
        </View>

        {/* Kartu kantor */}
        <View style={styles.officeCard}>
          <AppIcon color={colors.indigo} name="map_pin" size={28} style={styles.officeGlyphIcon} />
          <View style={styles.officeText}>
            <Text style={styles.officeName}>{OFFICE_NAME}</Text>
            <Text style={styles.officeAddress}>{OFFICE_ADDRESS}</Text>
            <Text style={styles.officeMeta}>
              Geofence {GEOFENCE_M.toLocaleString('id-ID')} m
            </Text>
          </View>
        </View>

        {/* Simulasi */}
        <View style={styles.simBox}>
          <View style={styles.simRow}>
            <Text style={styles.simLabel}>
              Simulasi: Posisi di luar area (&gt; 1.000 m)
            </Text>
            <Switch
              onValueChange={setSimFar}
              trackColor={{ false: colors.line, true: colors.orange }}
              value={simFar}
            />
          </View>
          <Text style={styles.simHint}>
            Kehadiran di luar area tetap diterima dengan penanda oranye.
          </Text>
        </View>

        <View style={styles.ctaWrap}>
          <ThemedButton
            onPress={handleConfirm}
            title="Konfirmasi & Clock In"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
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
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: { color: colors.ink, fontSize: 24, fontWeight: '700', marginTop: -3 },
  title: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 17 },
  mapBox: {
    alignItems: 'center',
    backgroundColor: '#e3ecf5',
    borderRadius: 22,
    height: 300,
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  geofence: {
    borderColor: colors.indigo,
    borderRadius: 130,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 260,
    position: 'absolute',
    width: 260,
  },
  officePin: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 3,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    width: 48,
  },
  pinGlyph: { fontSize: 24 },
  userPin: { left: '58%', position: 'absolute', top: '38%' },
  userPinFar: { left: '82%', top: '12%' },
  userDot: {
    backgroundColor: colors.indigo,
    borderColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    elevation: 3,
    height: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 24,
  },
  gpsChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.chip,
    bottom: 14,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
  },
  gpsChipIcon: { marginRight: 6 },
  gpsChipText: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12,
  },
  stats: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  statCell: { alignItems: 'center', flex: 1 },
  statValue: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 18,
  },
  statLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: { backgroundColor: colors.line, width: 1 },
  officeCard: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  officeGlyphIcon: { marginRight: 12 },
  officeText: { flex: 1 },
  officeName: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  officeAddress: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 13,
    marginTop: 2,
  },
  officeMeta: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginTop: 4,
  },
  simBox: {
    backgroundColor: '#fff',
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
  simLabel: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginRight: 8,
  },
  simHint: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 6,
  },
  ctaWrap: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
});
