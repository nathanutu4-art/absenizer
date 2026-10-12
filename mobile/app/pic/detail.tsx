import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import { REJECTION_REQUIRES_NOTE } from '../../src/lib/businessRules';
import { colors, radius, spacing, typography } from '../../src/theme';

/**
 * Detail pengajuan + keputusan PIC (setujui/tolak).
 * BR-14: penolakan WAJIB disertai catatan.
 *
 * TODO (Fase 3): ambil detail leave_requests by id; tulis ke approvals;
 * update status leave_requests; kurangi leave_balances bila disetujui
 * (cuti/ijin saja — sakit tidak memotong); kirim notifikasi ke karyawan.
 */
export default function PicDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approved: boolean) {
    setError(null);
    if (!approved && REJECTION_REQUIRES_NOTE && !note.trim()) {
      setError('Penolakan wajib disertai catatan.');
      return;
    }
    setBusy(true);
    try {
      // TODO: insert approvals + update leave_requests via supabase.
      await new Promise((r) => setTimeout(r, 500));
      Alert.alert(
        'Berhasil',
        `Pengajuan ${approved ? 'disetujui' : 'ditolak'}.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan keputusan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Detail Pengajuan</Text>
      <Text style={typography.caption}>ID: {id ?? '-'}</Text>

      <View style={styles.card}>
        <Row label="Karyawan" value="Maya Putri" />
        <Row label="Jenis" value="Sakit" />
        <Row label="Tanggal" value="12 Okt 2026" />
        <Row label="Alasan" value="Demam dan flu." />
        <Row label="Lampiran" value="surat-dokter.pdf (wajib untuk sakit)" />
      </View>

      <Text style={styles.label}>Catatan keputusan (wajib bila menolak)</Text>
      <TextInput
        multiline
        numberOfLines={3}
        onChangeText={setNote}
        placeholder="Tulis catatan…"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textArea]}
        value={note}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <ThemedButton
          title="Tolak"
          variant="danger"
          loading={busy}
          onPress={() => decide(false)}
        />
        <ThemedButton
          title="Setujui"
          loading={busy}
          onPress={() => decide(true)}
        />
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  error: { color: colors.danger, marginTop: spacing.sm },
  heading: { marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md },
  row: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    gap: 2,
    paddingVertical: spacing.sm,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
