import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import {
  HALF_DAY_IJIN_DEDUCTION,
  SICK_LEAVE_REQUIRES_DOCTOR_NOTE,
  type LeaveType,
} from '../../src/lib/businessRules';
import { colors, radius, spacing, typography } from '../../src/theme';

const TYPES: Array<{ key: LeaveType; label: string }> = [
  { key: 'cuti', label: 'Cuti Tahunan' },
  { key: 'ijin', label: 'Ijin' },
  { key: 'sakit', label: 'Sakit' },
];

/**
 * Form pengajuan cuti/ijin/sakit.
 *
 * Aturan:
 * - Sakit WAJIB lampiran surat dokter; boleh retroaktif (BR-24).
 * - Ijin setengah hari memotong kuota 1 (BR-22).
 * - Tidak boleh ada dua pengajuan aktif yang tanggalnya tumpang tindih (BR-15).
 *
 * TODO (Fase 3): upload lampiran ke Storage Supabase + insert leave_requests
 * (pic_id di-snapshot dari employee_profiles saat pengajuan dibuat — BR-12).
 */
export default function NewLeaveScreen() {
  const [type, setType] = useState<LeaveType>('cuti');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function pickAttachment() {
    const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
    if (!res.canceled && res.assets[0]) {
      setAttachment(res.assets[0].name);
    }
  }

  async function submit() {
    setError(null);
    if (!startDate.trim()) {
      setError('Isi tanggal mulai pengajuan.');
      return;
    }
    if (type === 'sakit' && SICK_LEAVE_REQUIRES_DOCTOR_NOTE && !attachment) {
      setError('Pengajuan sakit wajib melampirkan surat dokter.');
      return;
    }
    if (!reason.trim()) {
      setError('Isi alasan pengajuan.');
      return;
    }
    setSending(true);
    try {
      // TODO: upload lampiran + insert ke leave_requests via supabase.
      await new Promise((r) => setTimeout(r, 500));
      router.replace('/(tabs)/requests');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim pengajuan.');
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer>
      <Text style={[typography.title, styles.heading]}>Pengajuan Baru</Text>

      <Text style={styles.label}>Jenis pengajuan</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setType(t.key)}
            style={[styles.typeChip, type === t.key && styles.typeChipActive]}
          >
            <Text style={type === t.key ? styles.typeTextActive : styles.typeText}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === 'ijin' ? (
        <TouchableOpacity
          onPress={() => setHalfDay((v) => !v)}
          style={styles.checkRow}
        >
          <View style={[styles.checkbox, halfDay && styles.checkboxOn]}>
            {halfDay ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          <Text style={typography.body}>
            Setengah hari (memotong kuota {HALF_DAY_IJIN_DEDUCTION})
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.label}>Tanggal mulai (TTTT-BB-HH)</Text>
      <TextInput
        onChangeText={setStartDate}
        placeholder="2026-10-20"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={startDate}
      />

      <Text style={styles.label}>Tanggal selesai (TTTT-BB-HH)</Text>
      <TextInput
        onChangeText={setEndDate}
        placeholder="2026-10-22"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={endDate}
      />
      {type === 'sakit' ? (
        <Text style={typography.caption}>
          Sakit boleh diajukan retroaktif — tidak ada batas waktu pengajuan.
        </Text>
      ) : null}

      <Text style={styles.label}>Alasan</Text>
      <TextInput
        multiline
        numberOfLines={3}
        onChangeText={setReason}
        placeholder="Tulis alasan pengajuan…"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textArea]}
        value={reason}
      />

      {type === 'sakit' ? (
        <>
          <Text style={styles.label}>
            Surat dokter <Text style={styles.required}>*wajib</Text>
          </Text>
          <TouchableOpacity onPress={pickAttachment} style={styles.attachBox}>
            <Text style={typography.body}>
              {attachment ?? 'Pilih file surat dokter (foto/PDF)'}
            </Text>
          </TouchableOpacity>
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ThemedButton
        title="Kirim Pengajuan"
        loading={sending}
        onPress={submit}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  attachBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    padding: spacing.md,
  },
  button: { marginTop: spacing.lg },
  checkMark: { color: '#fff', fontWeight: '800' },
  checkRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxOn: { backgroundColor: colors.primary },
  error: { color: colors.danger, marginTop: spacing.sm },
  heading: { marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  label: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs },
  required: { color: colors.danger },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  typeChip: {
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeText: { color: colors.ink },
  typeTextActive: { color: '#fff', fontWeight: '700' },
});
