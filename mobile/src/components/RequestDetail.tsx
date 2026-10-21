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
import { MedallionIcon } from './MedallionIcon';
import { Plate } from './Plate';
import { PlateButton } from './PlateButton';
import { StampChip } from './StampChip';
import { showToast } from './Toast';
import {
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  getPicOf,
  type LeaveRequest,
  type RequestStatus,
} from '../data/demo';
import { colors, fontFamily, serifFamily, spacing } from '../theme';

interface Props {
  request: LeaveRequest;
  /** Judul header layar. */
  title: string;
  /** True untuk alur HR: tampilkan banner audit + teks pengambilalihan. */
  hrMode?: boolean;
}

const STATUS_CHIP: Record<RequestStatus, { color: string; backgroundColor: string }> = {
  menunggu: { color: colors.yellowText, backgroundColor: colors.yellowBg },
  disetujui: { color: colors.green, backgroundColor: colors.greenBg },
  ditolak: { color: colors.red, backgroundColor: colors.redBg },
};

/** Judul blok ukiran: serif + garis ganda di bawah. */
function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.blockWrap}>
      <Text style={styles.blockTitle}>{children}</Text>
      <View style={styles.ruleThick} />
      <View style={styles.ruleThin} />
    </View>
  );
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
  const chip = STATUS_CHIP[request.status];

  /**
   * Terapkan keputusan persetujuan/penolakan.
   * Penolakan wajib disertai catatan; keberhasilan ditandai toast
   * (mode HR menyebut pengambilalihan teraudit) lalu kembali ke layar sebelumnya.
   */
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
            <MedallionIcon glyph="chevron_left" size={36} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.backBtnSpacer} />
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scroll}>
        {hrMode ? (
          <Plate style={styles.auditPlate}>
            <View style={styles.platePad}>
              <View style={styles.auditRow}>
              <MedallionIcon glyph="shield" size={48} variant="wadaIndigo" />
                <View style={styles.auditText}>
                  <StampChip color={colors.orange} backgroundColor={colors.orangeBg}>
                    Audit
                  </StampChip>
                  <Text style={styles.auditTitle}>
                    Pengambilalihan oleh HR — Teraudit
                  </Text>
                  <Text style={styles.auditSub}>
                    Menyetujui/menolak di sini dicatat sebagai pengambilalihan HR
                    dalam log audit.
                  </Text>
                </View>
              </View>
            </View>
          </Plate>
        ) : null}

        {/* Kartu identitas pengajuan */}
        <Plate style={styles.card}>
          <View style={styles.platePadLg}>
            <View style={styles.cardTop}>
            <Avatar gradientId={employee.gradientId} name={employee.name} size={52} shape="square" />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{employee.name}</Text>
              <Text style={styles.cardDesc}>
                {TYPE_LABEL[request.type]} • {request.dateRange}
              </Text>
            </View>
            <StampChip color={chip.color} backgroundColor={chip.backgroundColor}>
              {STATUS_LABEL[request.status]}
            </StampChip>
          </View>
          {rows.map(([label, value], i) => (
            <View
              key={label}
              style={[
                styles.kvRow,
                i < rows.length - 1 && styles.kvDivider,
              ]}
            >
              <Text style={styles.kvLabel}>{label}</Text>
              <Text style={styles.kvValue}>{value}</Text>
            </View>
            ))}
            </View>
        </Plate>

        {/* ALASAN */}
        <Plate style={styles.card}>
          <View style={styles.platePadLg}>
            <BlockTitle>Alasan</BlockTitle>
            <Text style={styles.reason}>{request.reason}</Text>
          </View>
        </Plate>

        {/* Lampiran */}
        {request.attachment ? (
          <Plate style={styles.card}>
            <View style={styles.platePadLg}>
              <BlockTitle>Lampiran</BlockTitle>
              <TouchableOpacity
                onPress={() => showToast('Membuka lampiran…')}
                style={styles.attachBox}
              >
                <MedallionIcon glyph="file_text" size={40} variant="wadaIndigo" />
                <Text style={styles.attachName}>{request.attachment}</Text>
              </TouchableOpacity>
            </View>
          </Plate>
        ) : null}

        {/* Timeline */}
        <Plate style={styles.card}>
          <View style={styles.platePadLg}>
            <BlockTitle>Linimasa</BlockTitle>
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
        </Plate>

        {/* Keputusan */}
        {pending ? (
          <Plate style={styles.card}>
            <View style={styles.platePadLg}>
              <BlockTitle>Catatan Keputusan</BlockTitle>
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
              <PlateButton
                onPress={() => decide(false)}
                style={styles.decisionBtn}
                variant="danger"
              >
                Tolak
              </PlateButton>
              <PlateButton
                onPress={() => decide(true)}
                style={styles.decisionBtn}
                variant="primary"
              >
                Setujui
              </PlateButton>
            </View>
              <Text style={styles.decisionHint}>
                {hrMode
                  ? 'Keputusan ini dicatat sebagai pengambilalihan HR.'
                  : 'Keputusan diteruskan ke karyawan dan HR.'}
              </Text>
            </View>
          </Plate>
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
  backBtn: { height: 36, width: 36 },
  backBtnSpacer: { height: 36, width: 36 },
  headerTitle: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 17 },
  scroll: { padding: spacing.lg, paddingTop: spacing.sm },
  blockWrap: { marginBottom: spacing.sm },
  blockTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ruleThick: { backgroundColor: colors.ink, height: 3, marginTop: 6 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  auditPlate: { marginBottom: spacing.md },
  auditRow: { alignItems: 'center', flexDirection: 'row' },
  auditText: { flex: 1, marginLeft: 12 },
  auditTitle: {
    color: colors.orange,
    fontFamily: serifFamily('800'),
    fontSize: 14,
    marginTop: 6,
  },
  auditSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 3,
  },
  card: { marginBottom: spacing.md },
  platePad: { padding: spacing.md },
  platePadLg: { padding: spacing.lg },
  cardTop: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.sm },
  cardText: { flex: 1, marginLeft: 12 },
  cardName: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 16 },
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
  kvDivider: { borderBottomColor: colors.line, borderBottomWidth: 1 },
  kvLabel: {
    color: colors.ink3,
    fontFamily: fontFamily('500'),
    fontSize: 12.5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kvValue: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 12.5,
    marginLeft: 12,
    textAlign: 'right',
  },
  reason: { color: colors.ink, fontFamily: fontFamily('400'), fontSize: 14 },
  attachBox: {
    alignItems: 'center',
    backgroundColor: colors.paper2,
    borderColor: colors.ink,
    borderRadius: 3,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    padding: spacing.md,
  },
  attachName: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginLeft: 12,
  },
  timeline: { paddingLeft: 4 },
  node: { alignItems: 'center', flexDirection: 'row' },
  nodeDot: { height: 16, marginRight: 12, width: 16 },
  nodeDone: { backgroundColor: colors.green, borderColor: colors.etch, borderWidth: 1 },
  nodeCurrent: { backgroundColor: colors.yellowRing, borderColor: colors.etch, borderWidth: 1 },
  nodeLine: {
    backgroundColor: colors.ink,
    height: 22,
    marginLeft: 7,
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
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: 3,
    borderWidth: 1.5,
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
