import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import { colors, radius, spacing, typography } from '../../src/theme';

/**
 * Pengambilalihan approval oleh HR — BR-29 (Q-09).
 * Bila PIC berhalangan/tidak dapat memproses, HR dapat mengambil alih dan
 * memutus pengajuan yang masih Menunggu. Keputusan HR final; pengambilalihan
 * tercatat di approval & audit log. Penolakan tetap wajib catatan (BR-14).
 *
 * BATASAN (BR-33): HR dilarang mengambil alih pengajuan MILIK HR sendiri —
 * pengajuan HR langsung ke atasan teratas.
 *
 * TODO (Fase 3): query pengajuan menunggu yang PIC-nya berhalangan; tulis
 * approvals dengan taken_over_by_hr = true + alasan; audit log.
 */
export default function HrTakeoverScreen() {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const waiting = [
    { id: 'h1', employee: 'Rizky Ramadhan', type: 'Ijin', pic: 'Sari Wulandari' },
  ];

  async function takeOver(itemId: string, approved: boolean) {
    setError(null);
    if (!reason.trim()) {
      setError('Isi alasan pengambilalihan terlebih dahulu.');
      return;
    }
    if (!approved && !reason.trim()) {
      setError('Penolakan wajib disertai catatan.');
      return;
    }
    setBusy(true);
    try {
      // TODO: insert approvals (taken_over_by_hr=true, alasan) via supabase.
      await new Promise((r) => setTimeout(r, 500));
      Alert.alert(
        'Tercatat',
        `Pengajuan diambil alih HR dan ${approved ? 'disetujui' : 'ditolak'}. Tercatat di log audit.`,
      );
      void itemId;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengambil alih.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Ambil Alih Approval</Text>
      <Text style={[typography.body, styles.sub]}>
        Untuk pengajuan yang PIC-nya berhalangan. Keputusan HR bersifat final
        dan tercatat di audit log.
      </Text>

      <Text style={styles.label}>Alasan pengambilalihan</Text>
      <TextInput
        multiline
        onChangeText={setReason}
        placeholder="mis. PIC sedang cuti tahunan…"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textArea]}
        value={reason}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {waiting.map((w) => (
        <View key={w.id} style={styles.card}>
          <Text style={typography.subtitle}>
            {w.employee} — {w.type}
          </Text>
          <Text style={typography.caption}>PIC: {w.pic} (berhalangan)</Text>
          <StatusChip label="Menunggu" tone="warning" />
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => takeOver(w.id, false)}
              style={[styles.smallBtn, styles.deny]}
              disabled={busy}
            >
              <Text style={styles.smallText}>Tolak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => takeOver(w.id, true)}
              style={[styles.smallBtn, styles.allow]}
              disabled={busy}
            >
              <Text style={styles.smallText}>Setujui</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <ThemedButton
        title="Selesai"
        variant="outline"
        onPress={() => {}}
        style={styles.done}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  allow: { backgroundColor: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  deny: { backgroundColor: colors.danger },
  done: { marginTop: spacing.lg },
  error: { color: colors.danger, marginTop: spacing.sm },
  heading: { marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs },
  smallBtn: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  smallText: { color: '#fff', fontWeight: '700' },
  sub: { color: colors.inkSoft, marginBottom: spacing.sm },
  textArea: { minHeight: 64, textAlignVertical: 'top' },
});
