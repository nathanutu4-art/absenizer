import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import {
  GEOFENCE_RADIUS_M,
  MOCK_LOCATION_BLOCKS_CLOCK_IN,
  type FlagType,
  type WorkMode,
} from '../../src/lib/businessRules';
import { distanceMeters, isInsideGeofence } from '../../src/lib/geo';
import { getPositionWithMockCheck } from '../../src/lib/mockLocation';
import { colors, radius, spacing, typography } from '../../src/theme';

/**
 * Langkah 3: konfirmasi lokasi GPS sebelum clock in/out disimpan.
 *
 * Aturan yang diterapkan di sini:
 * - WFO: validasi terhadap 1 titik kantor (radius 1000 m). Di luar radius
 *   TETAP DITERIMA + penanda "Di Luar Area" (BR-06) — tidak ditolak.
 * - WFH: bebas lokasi; koordinat direkam untuk audit (BR-07).
 * - Mock location: SELALU diberi penanda "Fake GPS"; pada MVP tidak
 *   otomatis membatalkan (BR-09) — lihat MOCK_LOCATION_BLOCKS_CLOCK_IN.
 *
 * TODO (Fase 1): ambil titik kantor + work_mode karyawan dari Supabase
 * (company_settings & employee_profiles). Simpan attendance via Supabase
 * atau antrekan offline (offlineQueue) bila tidak ada koneksi.
 */
export default function ConfirmScreen() {
  const { kind, selfieUri } = useLocalSearchParams<{
    kind?: string;
    selfieUri?: string;
  }>();
  const clockKind = kind === 'out' ? 'out' : 'in';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workMode] = useState<WorkMode>('WFO'); // TODO: dari Supabase
  const [office] = useState({ latitude: -6.2, longitude: 106.816666 }); // TODO: dari company_settings
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { position: pos, mock } = await getPositionWithMockCheck();
        setPosition(pos);
        const nextFlags: FlagType[] = [];
        if (mock.isMocked) {
          // BR-09: flag saja; MOCK_LOCATION_BLOCKS_CLOCK_IN = false.
          nextFlags.push('fake_gps');
        }
        if (workMode === 'WFO') {
          const d = distanceMeters(pos, office);
          setDistance(d);
          if (!isInsideGeofence(pos, office, GEOFENCE_RADIUS_M)) {
            nextFlags.push('di_luar_area'); // BR-06: diterima + penanda
          }
        }
        setFlags(nextFlags);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Gagal mendapatkan lokasi.',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [office, workMode]);

  function submit() {
    if (MOCK_LOCATION_BLOCKS_CLOCK_IN && flags.includes('fake_gps')) {
      setError('Terdeteksi fake GPS. Absensi dibatalkan.');
      return;
    }
    // TODO (Fase 1): upload selfie ke Storage + insert attendance;
    // bila offline -> enqueueClockEvent() lalu sync otomatis saat online.
    router.push({
      pathname: '/clock-in/success',
      params: {
        kind: clockKind,
        flags: flags.join(','),
        selfieUri: selfieUri ?? '',
      },
    });
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Text style={typography.body}>Mengambil lokasi Anda…</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>
        Konfirmasi Lokasi — Clock {clockKind === 'in' ? 'In' : 'Out'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {position ? (
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: position.latitude,
              longitude: position.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={position} title="Posisi Anda" />
            {workMode === 'WFO' ? (
              <Circle
                center={office}
                radius={GEOFENCE_RADIUS_M}
                strokeColor={colors.primary}
                fillColor="rgba(0,87,186,0.12)"
              />
            ) : null}
          </MapView>
        </View>
      ) : null}

      <View style={styles.info}>
        <Text style={typography.body}>
          Mode kerja: <Text style={{ fontWeight: '700' }}>{workMode}</Text>
        </Text>
        {workMode === 'WFO' && distance !== null ? (
          <Text style={typography.body}>
            Jarak dari kantor: {(distance / 1000).toFixed(2)} km (radius{' '}
            {GEOFENCE_RADIUS_M / 1000} km)
          </Text>
        ) : (
          <Text style={typography.body}>
            WFH: bebas absen dari lokasi mana pun.
          </Text>
        )}
      </View>

      {flags.length > 0 ? (
        <View style={styles.flags}>
          <Text style={typography.subtitle}>Penanda pada absensi ini:</Text>
          <View style={styles.flagRow}>
            {flags.map((f) => (
              <StatusChip key={f} flag={f} />
            ))}
          </View>
          <Text style={typography.caption}>
            Penanda tidak membatalkan absensi — HR/PIC akan meninjaunya.
          </Text>
        </View>
      ) : (
        <Text style={typography.body}>Lokasi valid. Tanpa penanda.</Text>
      )}

      <ThemedButton
        title={`Konfirmasi Clock ${clockKind === 'in' ? 'In' : 'Out'}`}
        onPress={submit}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.sm },
  flagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  flags: { gap: spacing.sm, marginTop: spacing.md },
  heading: { marginBottom: spacing.md },
  info: { gap: spacing.xs, marginTop: spacing.md },
  map: { flex: 1 },
  mapWrap: {
    borderRadius: radius.md,
    height: 240,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
});
