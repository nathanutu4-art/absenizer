import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, radius, spacing, typography } from '../../src/theme';

interface AwayPerson {
  id: string;
  name: string;
  kind: 'cuti' | 'ijin' | 'sakit';
  detail: string;
}

interface BirthdayPerson {
  id: string;
  name: string;
  date: string;
  ageTurning: number;
  daysAway: number;
}

/**
 * Tim / Employee Info — dapat dilihat SEMUA karyawan (bukan khusus HR).
 * Bagian atas: avatar lingkaran untuk yang sedang cuti/ijin/sakit
 * (border merah = sakit, biru = cuti, kuning = ijin) + kotak 1:1 ulang tahun.
 * Klik nama/avatar membuka detail profil karyawan.
 *
 * TODO (Fase 3/4): ganti data contoh dengan query leave_requests (status
 * disetujui & tanggal mencakup hari ini) dan employee_profiles (ulang tahun).
 */
const AWAY: AwayPerson[] = [
  { id: 'e1', name: 'Sari Wulandari', kind: 'cuti', detail: 'Cuti • 12–16 Okt' },
  { id: 'e2', name: 'Maya Putri', kind: 'sakit', detail: 'Sakit • 12 Okt' },
  { id: 'e3', name: 'Fitri Rahmawati', kind: 'ijin', detail: 'Ijin • ½ hari' },
];

const BIRTHDAYS: BirthdayPerson[] = [
  { id: 'e4', name: 'Dedi Kurniawan', date: '30 Nov', ageTurning: 32, daysAway: 49 },
  { id: 'e5', name: 'Joko Prasetyo', date: '25 Des', ageTurning: 31, daysAway: 74 },
  { id: 'e6', name: 'Rina Marlina', date: '5 Jan', ageTurning: 27, daysAway: 85 },
];

const DIRECTORY = [
  'Sari Wulandari',
  'Maya Putri',
  'Fitri Rahmawati',
  'Dedi Kurniawan',
  'Joko Prasetyo',
  'Rina Marlina',
  'Rizky Ramadhan',
  'Ayu Lestari',
];

const LEGEND = [
  { kind: 'sakit', label: 'Sakit', color: colors.danger },
  { kind: 'cuti', label: 'Cuti', color: colors.info },
  { kind: 'ijin', label: 'Ijin', color: colors.warning },
] as const;

export default function TeamScreen() {
  const [away] = useState(AWAY);
  const [birthdays] = useState(BIRTHDAYS);

  function openDetail(name: string) {
    // TODO: teruskan employee id asli; layar detail mengambil dari Supabase.
    router.push({ pathname: '/(tabs)/profile', params: { name } });
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Tim</Text>

      <Text style={typography.subtitle}>Sedang Cuti / Ijin / Sakit</Text>
      <View style={styles.legendRow}>
        {LEGEND.map((l) => (
          <View key={l.kind} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <Text style={typography.caption}>{l.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.avatarRow}>
        {away.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => openDetail(p.name)}
            style={styles.avatarItem}
          >
            <Avatar name={p.name} size={56} statusBorder={p.kind} />
            <Text style={styles.avatarLabel} numberOfLines={2}>
              {p.name.split(' ')[0]}
            </Text>
            <Text style={typography.caption}>{p.detail}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.subtitle, styles.section]}>Ulang Tahun Terdekat</Text>
      <View style={styles.bdayGrid}>
        {birthdays.map((b) => (
          <TouchableOpacity
            key={b.id}
            onPress={() => openDetail(b.name)}
            style={styles.bdayBox}
          >
            <Text style={styles.bdayName} numberOfLines={2}>
              {b.name}
            </Text>
            <Text style={typography.caption}>{b.date}</Text>
            <Text style={typography.caption}>ke-{b.ageTurning}</Text>
            <Text style={styles.bdayDays}>{b.daysAway} hari lagi</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.subtitle, styles.section]}>Direktori Karyawan</Text>
      {DIRECTORY.map((name) => (
        <TouchableOpacity
          key={name}
          onPress={() => openDetail(name)}
          style={styles.row}
        >
          <Avatar name={name} size={40} />
          <Text style={typography.body}>{name}</Text>
        </TouchableOpacity>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarItem: { alignItems: 'center', width: 76 },
  avatarLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  bdayBox: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  bdayDays: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  bdayGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  bdayName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  dot: { borderRadius: 6, height: 12, width: 12 },
  heading: { marginBottom: spacing.sm },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  legendRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.xs },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  section: { marginTop: spacing.lg },
});
