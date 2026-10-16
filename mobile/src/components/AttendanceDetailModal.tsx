import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Plate } from './Plate';
import { Skeleton } from './Skeleton';
import { StampChip } from './StampChip';
import type { HistoryRow } from '../data/demo';
import { getSelfieSignedUrl } from '../lib/db';
import { calcDuration } from '../lib/duration';
import { colors, fontFamily, serifFamily, spacing } from '../theme';

interface Props {
  /** Baris riwayat yang ditampilkan; null = modal tertutup. */
  row: HistoryRow | null;
  onClose: () => void;
}

/** Baris label–nilai di dalam popup. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

/**
 * Popup detail kehadiran harian gaya ukiran: jam masuk/pulang, durasi,
 * foto selfie (dari Storage), lokasi, dan catatan status.
 * Ditutup via tombol X atau ketuk area gelap di luar kartu.
 */
export function AttendanceDetailModal({ row, onClose }: Props) {
  const [selfieInUrl, setSelfieInUrl] = useState<string | null>(null);
  const [selfieOutUrl, setSelfieOutUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  // MapView di dalam Modal Android kadang render kosong bila dimount
  // bersamaan dengan animasi modal. Tunda render peta sampai modal stabil.
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let alive = true;
    setSelfieInUrl(null);
    setSelfieOutUrl(null);
    setMapReady(false);
    if (!row) return;
    setPhotoLoading(true);
    const t = setTimeout(() => {
      if (alive) setMapReady(true);
    }, 400);
    (async () => {
      const [inUrl, outUrl] = await Promise.all([
        getSelfieSignedUrl(row.clockInSelfiePath),
        getSelfieSignedUrl(row.clockOutSelfiePath),
      ]);
      if (!alive) return;
      setSelfieInUrl(inUrl);
      setSelfieOutUrl(outUrl);
      setPhotoLoading(false);
    })();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [row]);

  const duration = row ? calcDuration(row.clockIn, row.clockOut) : '--';
  const locationText = (lat?: number | null, lng?: number | null) =>
    lat != null && lng != null
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : 'Tidak tercatat';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={row !== null}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardTouch}>
          <Plate solidColor="rgba(2,85,179,0.85)" style={styles.card}>
            <View style={styles.cardInner}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Kepala */}
                <View style={styles.headRow}>
                  <View style={styles.headText}>
                    <Text style={styles.title}>Detail Kehadiran</Text>
                    <Text style={styles.subtitle}>
                      {row
                        ? `${row.dateLabel}, ${row.dayNum} ${row.monthYear}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={onClose}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.doubleRule}>
                  <View style={styles.ruleThick} />
                  <View style={styles.ruleThin} />
                </View>

                {row ? (
                  <>
                    {/* Status */}
                    <View style={styles.chipRow}>
                      <StampChip
                        color="#ffffff"
                        backgroundColor="rgba(255,255,255,0.2)"
                      >
                        {row.status}
                      </StampChip>
                      {row.flags.map((f, fi) => (
                        <StampChip
                          key={`${f}-${fi}`}
                          color={colors.orange}
                          backgroundColor={colors.orangeBg}
                          style={styles.flagChip}
                        >
                          {f}
                        </StampChip>
                      ))}
                    </View>

                    {/* Jam */}
                    <DetailRow label="Jam Masuk" value={row.clockIn} />
                    <DetailRow label="Jam Pulang" value={row.clockOut} />
                    <DetailRow label="Total Jam Kerja" value={duration} />

                    {/* Foto selfie */}
                    <Text style={styles.sectionLabel}>Foto Selfie</Text>
                    {photoLoading ? (
                      <Skeleton width="100%" height={180} borderRadius={2} />
                    ) : (
                      <View style={styles.photoRow}>
                        <View style={styles.photoBox}>
                          <Text style={styles.photoLabel}>Masuk</Text>
                          {selfieInUrl ? (
                            <Image
                              resizeMode="cover"
                              source={{ uri: selfieInUrl }}
                              style={styles.photo}
                            />
                          ) : (
                            <View style={styles.photoEmpty}>
                              <Text style={styles.photoEmptyIcon}>📷</Text>
                              <Text style={styles.photoEmptyText}>
                                Tidak ada foto
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.photoBox}>
                          <Text style={styles.photoLabel}>Pulang</Text>
                          {row.clockOut === '-' ? (
                            <View style={styles.photoEmpty}>
                              <Text style={styles.photoEmptyIcon}>📷</Text>
                              <Text style={styles.photoEmptyText}>
                                Belum clock out
                              </Text>
                            </View>
                          ) : selfieOutUrl ? (
                            <Image
                              resizeMode="cover"
                              source={{ uri: selfieOutUrl }}
                              style={styles.photo}
                            />
                          ) : (
                            <View style={styles.photoEmpty}>
                              <Text style={styles.photoEmptyIcon}>📷</Text>
                              <Text style={styles.photoEmptyText}>
                                Tidak ada foto
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Lokasi */}
                    <Text style={styles.sectionLabel}>Lokasi</Text>
                    <DetailRow
                      label="Clock In"
                      value={locationText(row.clockInLat, row.clockInLng)}
                    />
                    <DetailRow
                      label="Clock Out"
                      value={locationText(row.clockOutLat, row.clockOutLng)}
                    />
                    {row.clockInLat != null && row.clockInLng != null ? (
                      mapReady ? (
                        <MapView
                          style={styles.map}
                          initialRegion={{
                            latitude: row.clockInLat,
                            longitude: row.clockInLng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                        >
                          <Marker
                            coordinate={{
                              latitude: row.clockInLat,
                              longitude: row.clockInLng,
                            }}
                            title="Clock In"
                            pinColor={colors.green}
                          />
                          {row.clockOutLat != null &&
                          row.clockOutLng != null ? (
                            <Marker
                              coordinate={{
                                latitude: row.clockOutLat,
                                longitude: row.clockOutLng,
                              }}
                              title="Clock Out"
                              pinColor={colors.orange}
                            />
                          ) : null}
                        </MapView>
                      ) : (
                        <Skeleton width="100%" height={180} borderRadius={2} />
                      )
                    ) : (
                      <View style={styles.photoEmpty}>
                        <Text style={styles.photoEmptyText}>
                          Lokasi tidak tercatat
                        </Text>
                      </View>
                    )}
                  </>
                ) : null}
              </ScrollView>
            </View>
          </Plate>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 22, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  cardTouch: { width: '100%' },
  card: { width: '100%' },
  cardInner: { maxHeight: 520, padding: spacing.lg },
  headRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headText: { flex: 1 },
  title: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 19,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: { marginLeft: spacing.sm, padding: 6 },
  closeText: {
    color: '#ffffff',
    fontFamily: fontFamily('800'),
    fontSize: 20,
  },
  doubleRule: { marginTop: spacing.sm },
  ruleThick: { backgroundColor: 'rgba(255,255,255,0.6)', height: 3 },
  ruleThin: { backgroundColor: 'rgba(255,255,255,0.6)', height: 1, marginTop: 3 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  flagChip: { marginLeft: 6 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('600'),
    fontSize: 13,
  },
  detailValue: {
    color: '#ffffff',
    fontFamily: fontFamily('700'),
    fontSize: 13,
  },
  sectionLabel: {
    color: '#ffffff',
    fontFamily: serifFamily('800'),
    fontSize: 14,
    marginBottom: 2,
    marginTop: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoBox: { flex: 1 },
  photoLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginBottom: 6,
  },
  photo: {
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    height: 180,
    width: '100%',
  },
  photoEmpty: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 180,
    justifyContent: 'center',
  },
  photoEmptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fontFamily('500'),
    fontSize: 12,
  },
  photoEmptyIcon: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  map: {
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    height: 180,
    marginTop: spacing.sm,
    width: '100%',
  },
});
