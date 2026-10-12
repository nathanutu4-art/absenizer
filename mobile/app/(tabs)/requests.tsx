import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import { colors, radius, spacing, typography } from '../../src/theme';

interface MyRequest {
  id: string;
  type: string;
  dates: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
}

/**
 * Pengajuan saya — daftar + tombol ke sisa kuota dan form baru.
 * TODO (Fase 3): query leave_requests milik pengguna yang masuk.
 */
export default function RequestsScreen() {
  const [items] = useState<MyRequest[]>([
    { id: 'r1', type: 'Cuti Tahunan', dates: '20–22 Okt 2026', status: 'Menunggu' },
    { id: 'r2', type: 'Ijin', dates: '3 Okt 2026 (½ hari)', status: 'Disetujui' },
  ]);

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Pengajuan Saya</Text>

      <View style={styles.actions}>
        <ThemedButton
          title="Sisa Kuota"
          variant="outline"
          onPress={() => router.push('/leave/quota')}
        />
        <ThemedButton
          title="+ Pengajuan Baru"
          onPress={() => router.push('/leave/new')}
        />
      </View>

      {items.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={typography.subtitle}>{r.type}</Text>
          <Text style={typography.body}>{r.dates}</Text>
          <StatusChip
            label={r.status}
            tone={
              r.status === 'Disetujui'
                ? 'success'
                : r.status === 'Ditolak'
                  ? 'danger'
                  : 'warning'
            }
          />
        </View>
      ))}
      {items.length === 0 ? (
        <Text style={typography.body}>Belum ada pengajuan.</Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  heading: { marginBottom: spacing.md },
});
