import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from './Avatar';
import { StatusChip } from './StatusChip';
import { ThemedButton } from './ThemedButton';
import { showToast } from './Toast';
import {
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  getPicOf,
  type LeaveRequest,
} from '../data/demo';
import { colors, fontFamily, radius, spacing } from '../theme';

interface Props {
  request: LeaveRequest;
  /** Judul header layar. */
  title: string;
  /** True untuk alur HR: tampilkan banner audit + teks pengambilalihan. */
  hrMode?: boolean;
}

/**
 * Detail pengajuan — dipakai PIC (persetujuan) dan HR (pengambilalihan).
 * Keputusan hanya tersedia saat status "menunggu".
 */
export function RequestDetail({ request, title, hrMode = false }: Props) {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const employee = getEmployee(request.employeeId);
  const pic = getPicOf(employee);
  const pending = request.status === 'menunggu';

  const tone =
    request.status === 'menunggu'
      ? 'yellow'
      : request.status === 'disetujui'
        ? 'green'
        : 'red';

  function decide(approved: boolean) {
    if (!approved && !note.trim()) {
      setError('Penolakan wajib disertai catatan.');
      return;
    }
    setError(null);
    if (hrMode) {
      showToast(
        approved
          ? 'Disetujui — diambil alih HR, teraudit.'
          : 'Ditolak — diambil alih HR, teraudit.',
      );
    } else {
      showToast(approved ? 'Pengajuan disetujui.' : 'Pengajuan ditolak.');
    }
    router.back();
  }

  const rows: [string, string][] = [
    ['Nama', employee.name],
    ['Jenis', TYPE_LABEL[request.type]],
    ['Rentang', request.dateRange],
    ['Diajukan', request.submittedAt],
    ['PIC', pic.name],
  ];
  if (request.takenOverBy) rows.push(['Diambil Alih Oleh', request.takenOverBy]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scroll}>
        {hrMode ? (
          <View style={styles.auditBanner}>
            <Text style={styles.auditGlyph}>🛡️</Text>
            <View style={styles.auditText}>
              <Text style={styles.auditTitle}>
                Pengambilalihan oleh HR — Teraudit
              </Text>
              <Text style={styles.auditSub}>
                Menyetujui/menolak di sini dicatat sebagai pengambilalihan HR
                dalam log audit.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Kartu pengajuan */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Avatar gradientId={employee.gradientId} name={employee.name} size={52} />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{employee.name}</Text>
              <Text style={styles.cardDesc}>
                {TYPE_LABEL[request.type]} • {request.dateRange}
              </Text>
            </View>
            <StatusChip label={STATUS_LABEL[request.status]} tone={tone} />
          </View>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.kvRow}>
              <Text style={styles.kvLabel}>{label}</Text>
              <Text style={styles.kvValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ALASAN */}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>ALASAN</Text>
          <Text style={styles.reason}>{request.reason}</Text>
        </View>

        {/* Lampiran */}
        {request.attachment ? (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>LAMPIRAN</Text>
            <TouchableOpacity
              onPress={() => showToast('Membuka lampiran…')}
              style={styles.attachBox}
            >
              <Text style={styles.attachGlyph}>📄</Text>
              <Text style={styles.attachName}>{request.attachment}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>LINIMASA</Text>
          <View style={styles.timeline}>
            <View style={styles.node}>
              <View style={[styles.nodeDot, styles.nodeDone]} />
              <View>
                <Text style={styles.nodeTitle}>Diajukan</Text>
                <Text style={styles.nodeSub}>{request.submittedAt}</Text>
              </View>
            </View>
            <View style={styles.nodeLine} />
            <View style={styles.node}>
              <View
                style={[
                  styles.nodeDot,
                  pending ? styles.nodeCurrent : styles.nodeDone,
                ]}
              />
              <View>
                <Text style={styles.nodeTitle}>
                  {pending
                    ? 'Menunggu keputusan'
                    : STATUS_LABEL[request.status]}
                </Text>
                {request.decidedNote ? (
                  <Text style={styles.nodeSub}>{request.decidedNote}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Keputusan */}
        {pending ? (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>CATATAN KEPUTUSAN</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setNote}
              placeholder={
                hrMode
                  ? 'Catatan pengambilalihan (wajib bila menolak)…'
                  : 'Catatan (wajib bila menolak)…'
              }
              placeholderTextColor={colors.ink3}
              style={[styles.input, styles.textarea]}
              textAlignVertical="top"
              value={note}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.decisionRow}>
              <ThemedButton
                onPress={() => decide(false)}
                style={styles.decisionBtn}
                title="Tolak"
                variant="danger"
              />
              <ThemedButton
                onPress={() => decide(true)}
                style={styles.decisionBtn}
                title="Setujui"
                variant="success"
              />
            </View>
            <Text style={styles.decisionHint}>
              {hrMode
                ? 'Keputusan ini dicatat sebagai pengambilalihan HR.'
                : 'Keputusan diteruskan ke karyawan dan HR.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  safe: { backgroundColor: colors.bg },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: { color: colors.ink, fontSize: 24, fontWeight: '700', marginTop: -3 },
  headerTitle: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 17 },
  scroll: { padding: spacing.lg, paddingTop: spacing.sm },
  auditBanner: {
    backgroundColor: colors.orangeBg,
    borderColor: colors.orange,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  auditGlyph: { fontSize: 26, marginRight: 12 },
  auditText: { flex: 1 },
  auditTitle: { color: colors.orange, fontFamily: fontFamily('800'), fontSize: 14 },
  auditSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardTop: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm },
  cardText: { flex: 1, marginLeft: 12 },
  cardName: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 16 },
  cardDesc: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 12.5,
    marginTop: 2,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  kvLabel: { color: colors.ink3, fontFamily: fontFamily('500'), fontSize: 12.5 },
  kvValue: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 12.5,
    marginLeft: 12,
    textAlign: 'right',
  },
  blockTitle: {
    color: colors.ink3,
    fontFamily: fontFamily('700'),
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  reason: { color: colors.ink, fontFamily: fontFamily('400'), fontSize: 14 },
  attachBox: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 15,
    flexDirection: 'row',
    padding: spacing.md,
  },
  attachGlyph: { fontSize: 26, marginRight: 12 },
  attachName: { color: colors.ink, fontFamily: fontFamily('600'), fontSize: 13 },
  timeline: { paddingLeft: 4 },
  node: { alignItems: 'center', flexDirection: 'row' },
  nodeDot: { borderRadius: 9, height: 18, marginRight: 12, width: 18 },
  nodeDone: { backgroundColor: colors.green },
  nodeCurrent: { backgroundColor: colors.yellowRing },
  nodeLine: {
    backgroundColor: colors.line,
    height: 22,
    marginLeft: 8,
    width: 2,
  },
  nodeTitle: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 13.5 },
  nodeSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textarea: { minHeight: 84 },
  error: {
    color: colors.red,
    fontFamily: fontFamily('600'),
    fontSize: 12.5,
    marginTop: spacing.sm,
  },
  decisionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  decisionBtn: { flex: 1 },
  decisionHint: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 11.5,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
