import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
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
import { recordClockIn, recordClockOut, getClockState } from '../../src/lib/clockState';
import { distanceMeters, isInsideGeofence } from '../../src/lib/geo';
import { getSelfiePhoto, clearSelfiePhoto } from '../../src/lib/selfiePhoto';
import { showToast } from '../../src/components/Toast';
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
    getCompanySettings()
      .then((s) => {
        if (alive) setSettings(s);
      })
      .catch(() => {
        if (alive) setSettings(DEMO_SETTINGS);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Validasi alur: kind harus 'in' | 'out', dan clock-out hanya valid
  // bila phase lokal memang 'out' (cegah deep-link bypass).
  useEffect(() => {
    if (kind !== undefined && kind !== 'in' && kind !== 'out') {
      router.replace('/(tabs)/home');
      return;
    }
    if (isOut && getClockState().phase !== 'out') {
      router.replace('/(tabs)/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Animasi radar saat lokasi loading
  const radarAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [radarAnim]);

  const office = settings ?? DEMO_SETTINGS;
  const officeCoord = { latitude: office.officeLat, longitude: office.officeLng };
  const realDist = coords ? distanceMeters(coords, officeCoord) : null;
  const realInside = coords ? isInsideGeofence(coords, officeCoord, office.geofenceM) : null;
  // Toggle simulasi menimpa hasil GPS asli (untuk demo).
  const isFar = simFar || (realInside === false);
  // Lokasi masih loading: coords null dan tidak ditolak
  const locLoading = coords === null && !locDenied;
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
    // Upload selfie lalu simpan ke Supabase — best-effort,
    // clock-in/out tidak diblokir bila upload gagal.
    // Selfie wajib: tolak bila tidak ada foto yang diambil.
    const photoUri = getSelfiePhoto();
    if (!photoUri) {
      showToast('Foto selfie wajib diambil. Kembali dan ambil foto.');
      setBusy(false);
      return;
    }
    const employeeId = await getMyEmployeeId();
    if (!employeeId) {
      showToast('Data karyawan tidak ditemukan. Coba login ulang.');
      setBusy(false);
      return;
    }
    // Upload selfie; bila gagal, absensi tetap dicatat tanpa foto.
    let selfieUrl: string | null = null;
    try {
      selfieUrl = await uploadSelfie(photoUri, employeeId, isOut ? 'out' : 'in');
      // TEMP DEBUG: hapus setelah masalah selfie teratasi
      if (!selfieUrl) {
        showToast('DEBUG: uploadSelfie return null (upload gagal)');
      }
    } catch {
      showToast('Foto gagal diunggah, absensi tetap tercatat.');
    }
    // Simpan ke database DULU; hanya lanjut bila sukses.
    let ok = false;
    try {
      ok = isOut
        ? await saveClockOut({ coords, selfieUrl })
        : await saveAttendance({
            isFar,
            distanceM: realDist,
            coords,
            selfieUrl,
          });
    } catch {
      ok = false;
    }
    if (!ok) {
      showToast('Gagal menyimpan ke server, coba lagi.');
      setBusy(false);
      return;
    }
    // Sukses: catat status lokal, bersihkan foto, lalu ke layar sukses.
    // `replace` agar tombol back tidak bisa re-konfirmasi (timestamp aman).
    if (isOut) recordClockOut(now);
    else recordClockIn(now, flags);
    clearSelfiePhoto();
    setBusy(false);
    router.replace({
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
      {/* Background: putih dengan sentuhan gradient lembut */}
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
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
        <Plate solidColor="rgba(2,85,179,0.85)" style={styles.mapPlate}>
          <View style={styles.mapInner}>
            {/* lingkaran geofence */}
            <View style={styles.geofence} />
            {/* pin kantor */}
            <View style={styles.officePin}>
              <MedallionIcon glyph="building" size={46} variant="cream" />
            </View>
            {locLoading ? (
              /* Animasi radar saat lokasi loading */
              <View style={styles.radarWrap}>
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      opacity: radarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0],
                      }),
                      transform: [
                        {
                          scale: radarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1.5],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.radarRing,
                    {
                      opacity: radarAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.6, 0],
                      }),
                      transform: [
                        {
                          scale: radarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1.5],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.radarCenter}>
                  <MedallionIcon glyph="map_pin" size={40} variant="wadaIndigo" />
                </View>
                <Text style={styles.radarText}>Mencari lokasi…</Text>
              </View>
            ) : (
              /* pin pengguna */
              <View style={[styles.userPin, isFar && styles.userPinFar]}>
                <View style={styles.userDot} />
              </View>
            )}
            <View style={styles.gpsChipWrap}>
              <StampChip color={colors.green} backgroundColor={colors.greenBg}>
                {gpsLabel}
              </StampChip>
            </View>
          </View>
        </Plate>

        {/* Statistik jarak */}
        <View style={styles.statsRow}>
          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.statPlate}>
            <View style={styles.statInner}>
              <Text style={styles.statValue}>{distanceLabel}</Text>
              <Text style={styles.statLabel}>Jarak ke kantor</Text>
            </View>
          </Plate>
          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.statPlate}>
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
        <Plate solidColor="rgba(2,85,179,0.85)" style={styles.officePlate}>
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
        <Plate solidColor="rgba(2,85,179,0.85)" style={styles.simPlate}>
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
          <PlateButton
            disabled={locLoading || busy}
            onPress={handleConfirm}
            variant="accent"
          >
            {busy
              ? 'Mengirim…'
              : locLoading
                ? 'Mencari lokasi…'
                : isOut
                  ? 'Konfirmasi & Clock Out'
                  : 'Konfirmasi & Clock In'}
          </PlateButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.card,
    height: 300,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  geofence: {
    borderColor: 'rgba(255,255,255,0.55)',
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
  /* Animasi radar saat lokasi loading */
  radarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: '58%',
    position: 'absolute',
    top: '38%',
  },
  radarRing: {
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 60,
    borderWidth: 2,
    height: 120,
    position: 'absolute',
    width: 120,
  },
  radarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarText: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('600'),
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
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
    color: '#ffffff',
    fontFamily: fontFamily('800'),
    fontSize: 18,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
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
  officeName: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 14 },
  officeAddress: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily('400'),
    fontSize: 13,
    marginTop: 2,
  },
  officeMeta: {
    color: 'rgba(255,255,255,0.7)',
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
    color: '#ffffff',
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginRight: 8,
  },
  simHint: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 6,
  },
  ctaWrap: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
});
