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
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { StampChip } from '../../src/components/StampChip';
import {
  GEOFENCE_M,
  OFFICE_ADDRESS,
  OFFICE_NAME,
} from '../../src/data/demo';
import { recordClockIn } from '../../src/lib/clockState';
import { colors, fontFamily, radius, serifFamily, spacing } from '../../src/theme';

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
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.back()}
          >
            <MedallionIcon glyph="chevron_left" size={36} variant="ink" />
          </TouchableOpacity>
          <Text style={styles.title}>Konfirmasi GPS</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Peta simulasi */}
        <Plate style={styles.mapPlate}>
          <View style={styles.mapInner}>
            {/* lingkaran geofence */}
            <View style={styles.geofence} />
            {/* pin kantor */}
            <View style={styles.officePin}>
              <MedallionIcon glyph="building" size={46} variant="ink" />
            </View>
            {/* pin pengguna */}
            <View style={[styles.userPin, simFar && styles.userPinFar]}>
              <View style={styles.userDot} />
            </View>
            <View style={styles.gpsChipWrap}>
              <StampChip color={colors.green} backgroundColor={colors.greenBg}>
                GPS Akurat ±8 m
              </StampChip>
            </View>
          </View>
        </Plate>

        {/* Statistik jarak */}
        <View style={styles.statsRow}>
          <Plate style={styles.statPlate}>
            <View style={styles.statInner}>
              <Text style={styles.statValue}>{distanceLabel}</Text>
              <Text style={styles.statLabel}>Jarak ke kantor</Text>
            </View>
          </Plate>
          <Plate style={styles.statPlate}>
            <View style={styles.statInner}>
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
          </Plate>
        </View>

        {/* Kartu kantor */}
        <Plate style={styles.officePlate}>
          <View style={styles.officeInner}>
            <MedallionIcon glyph="map_pin" size={44} variant="ink" />
            <View style={styles.officeText}>
              <Text style={styles.officeName}>{OFFICE_NAME}</Text>
              <Text style={styles.officeAddress}>{OFFICE_ADDRESS}</Text>
              <Text style={styles.officeMeta}>
                Geofence {GEOFENCE_M.toLocaleString('id-ID')} m
              </Text>
            </View>
          </View>
        </Plate>

        {/* Simulasi */}
        <Plate style={styles.simPlate}>
          <View style={styles.simInner}>
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
        </Plate>

        <View style={styles.ctaWrap}>
          <PlateButton onPress={handleConfirm} variant="primary">
            Konfirmasi & Clock In
          </PlateButton>
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
  headerSpacer: { height: 36, width: 36 },
  title: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 18,
  },
  mapPlate: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
  mapInner: {
    alignItems: 'center',
    backgroundColor: colors.paper2,
    borderRadius: radius.card,
    height: 300,
    justifyContent: 'center',
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
    justifyContent: 'center',
  },
  userPin: { left: '58%', position: 'absolute', top: '38%' },
  userPinFar: { left: '82%', top: '12%' },
  userDot: {
    backgroundColor: colors.indigo,
    borderColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 3,
    height: 24,
    width: 24,
  },
  gpsChipWrap: {
    alignItems: 'center',
    bottom: 14,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statPlate: { flex: 1 },
  statInner: { alignItems: 'center', padding: spacing.md },
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
  officePlate: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  officeInner: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  officeText: { flex: 1, marginLeft: 12 },
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
  simPlate: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  simInner: { padding: spacing.md },
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
