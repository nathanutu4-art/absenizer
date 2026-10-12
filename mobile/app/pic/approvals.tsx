import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { colors, radius, spacing, typography } from '../../src/theme';

interface PendingItem {
  id: string;
  employee: string;
  type: string;
  dates: string;
}

/**
 * Daftar pengajuan menunggu persetujuan PIC.
 * TODO (Fase 3): query leave_requests WHERE pic_id = pengguna & status = 'menunggu'.
 * TODO: sembunyikan rute ini untuk non-PIC (guard peran dari Supabase).
 */
export default function PicApprovalsScreen() {
  const [items] = useState<PendingItem[]>([
    { id: 'p1', employee: 'Maya Putri', type: 'Sakit', dates: '12 Okt 2026' },
    { id: 'p2', employee: 'Dedi Kurniawan', type: 'Cuti Tahunan', dates: '20–22 Okt 2026' },
  ]);

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Persetujuan PIC</Text>
      <Text style={[typography.body, styles.sub]}>
        {items.length} pengajuan menunggu keputusan Anda.
      </Text>

      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() =>
            router.push({ pathname: '/pic/detail', params: { id: item.id } })
          }
          style={styles.card}
        >
          <Text style={typography.subtitle}>{item.employee}</Text>
          <Text style={typography.body}>
            {item.type} • {item.dates}
          </Text>
          <StatusChip label="Menunggu" tone="warning" />
        </TouchableOpacity>
      ))}
      {items.length === 0 ? (
        <Text style={typography.body}>Tidak ada pengajuan menunggu.</Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  heading: { marginBottom: spacing.xs },
  sub: { color: colors.inkSoft, marginBottom: spacing.md },
});
