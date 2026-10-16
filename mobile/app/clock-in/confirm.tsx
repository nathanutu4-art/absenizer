import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { StampChip } from '../../src/components/StampChip';
import { OFFICE_ADDRESS } from '../../src/data/demo';
import {
  DEMO_SETTINGS,
  getCompanySettings,
  getMyEmployeeId,
  saveAttendance,
  saveClockOut,
  uploadSelfie,
  type CompanySettings,
} from '../../src/lib/db';
import { recordClockIn, recordClockOut } from '../../src/lib/clockState';
import { distanceMeters, isInsideGeofence } from '../../src/lib/geo';
import { getSelfiePhoto } from '../../src/lib/selfiePhoto';
import { colors, fontFamily, radius, serifFamily, spacing } from '../../src/theme';

/** Format jarak: "850 m" atau "1,4 km". */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Konfirmasi GPS — lokasi asli perangkat (expo-location) dihitung terhadap
 * titik kantor. Peta tetap ilustrasi gaya ukiran. Toggle "di luar area"
 * memaksa skenario demo. Di luar area TETAP DITERIMA + penanda oranye.
 */
export default function ConfirmScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const isOut = kind === 'out';
  const [simFar, setSimFar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] =
    useState<Pick<Location.LocationObjectCoords, 'latitude' | 'longitude' | 'accuracy'> | null>(null);
  const [locDenied, setLocDenied] = useState(false);
  // Pengaturan kantor dari Supabase; fallback ke konstanta demo saat memuat.
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    let alive = true;
    getCompanySettings().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!alive) return;
      if (status !== 'granted') {
        setLocDenied(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (alive) {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        }
      } catch {
        if (alive) setLocDenied(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const office = settings ?? DEMO_SETTINGS;
  const officeCoord = { latitude: office.officeLat, longitude: office.officeLng };
  const realDist = coords ? distanceMeters(coords, officeCoord) : null;
  const realInside = coords ? isInsideGeofence(coords, officeCoord, office.geofenceM) : null;
  // Toggle simulasi menimpa hasil GPS asli (untuk demo).
  const isFar = simFar || (realInside === false);
  const distanceLabel = simFar
    ? '1,4 km'
    : realDist == null
      ? '…'
      : formatDistance(realDist);
  const areaLabel = isFar ? 'Di Luar Area' : 'Di Dalam Area';
  const gpsLabel = locDenied
    ? 'GPS ditolak — pakai simulasi'
    : coords
      ? `GPS ±${Math.round(coords.accuracy ?? 0)} m`
      : 'Mencari GPS…';

  async function handleConfirm() {
    if (busy) return;
    setBusy(true);
    const now = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    })
      .format(new Date())
      .replace(':', '.');
    const flags: string[] = [];
    if (isFar) flags.push('Di Luar Area');
    // Upload selfie (resize dulu) lalu simpan ke Supabase — best-effort,
    // clock-in/out tidak diblokir bila upload gagal.
    try {
      const photoUri = getSelfiePhoto();
      const employeeId = await getMyEmployeeId();
      const selfieUrl =
        photoUri && employeeId
          ? await uploadSelfie(photoUri, employeeId, isOut ? 'out' : 'in')
          : null;
      if (isOut) {
        recordClockOut(now);
        await saveClockOut({ coords, selfieUrl });
      } else {
        recordClockIn(now, flags);
        await saveAttendance({
          isFar,
          distanceM: realDist,
          coords,
          selfieUrl,
        });
      }
    } catch {
      // Diabaikan — status lokal sudah tercatat.
      if (isOut) recordClockOut(now);
      else recordClockIn(now, flags);
    } finally {
      setBusy(false);
    }
    router.push({
      pathname: '/clock-in/success',
      params: {
        time: now,
        distance: distanceLabel,
        ...(isFar ? { simFar: '1' } : {}),
        ...(isOut ? { kind: 'out' } : {}),
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
              <MedallionIcon glyph="building" size={46} variant="wadaIndigo" />
            </View>
            {/* pin pengguna */}
            <View style={[styles.userPin, isFar && styles.userPinFar]}>
              <View style={styles.userDot} />
            </View>
            <View style={styles.gpsChipWrap}>
              <StampChip color={colors.green} backgroundColor={colors.greenBg}>
                {gpsLabel}
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
                  isFar ? { color: colors.orange } : { color: colors.green },
                ]}
              >
                {areaLabel}
              </Text>
              <Text style={styles.statLabel}>Status area</Text>
            </View>
          </Plate>
        </View>

        {/* Kartu kantor */}
        <Plate glass tintColor="rgba(1,86,179,0.12)" style={styles.officePlate}>
          <View style={styles.officeInner}>
            <MedallionIcon glyph="map_pin" size={44} variant="ink" />
            <View style={styles.officeText}>
              <Text style={styles.officeName}>{office.officeName}</Text>
              <Text style={styles.officeAddress}>{OFFICE_ADDRESS}</Text>
              <Text style={styles.officeMeta}>
                Geofence {office.geofenceM.toLocaleString('id-ID')} m
              </Text>
              {coords && (
                <Text style={styles.officeMeta}>
                  {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>
        </Plate>

        {/* Simulasi */}
        <Plate glass tintColor="rgba(1,86,179,0.12)" style={styles.simPlate}>
          <View style={styles.simInner}>
            <View style={styles.simRow}>
              <Text style={styles.simLabel}>
                Simulasi: Posisi di luar area (&gt; 1.000 m)
              </Text>
              <Switch
                onValueChange={setSimFar}
                trackColor={{ false: colors.line, true: colors.blue }}
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
            {busy ? 'Mengirim…' : 'Konfirmasi & Clock In'}
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
