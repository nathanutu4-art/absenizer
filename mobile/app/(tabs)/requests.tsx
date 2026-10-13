import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../src/components/AppIcon';
import { Avatar } from '../../src/components/Avatar';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import { showToast } from '../../src/components/Toast';
import type { IconName } from '../../src/data/icons';
import {
  MY_REQUESTS,
  QUOTAS,
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  type LeaveRequest,
  type RequestStatus,
  type RequestType,
} from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

type Segment = 'baru' | 'kuota' | 'riwayat';

const TYPE_CARD: Record<RequestType, { bg: string; fg: string; icon: IconName }> = {
  cuti: { bg: colors.blueBg, fg: colors.blue, icon: 'umbrella' },
  ijin: { bg: colors.yellowBg, fg: colors.yellowText, icon: 'clipboard' },
  sakit: { bg: colors.redBg, fg: colors.red, icon: 'thermometer' },
};

const REQ_STATUS_TONE: Record<RequestStatus, 'yellow' | 'green' | 'red'> = {
  menunggu: 'yellow',
  disetujui: 'green',
  ditolak: 'red',
};

/** Pengajuan — Buat Baru / Sisa Kuota / Pengajuanku. */
export default function RequestsScreen() {
  const [segment, setSegment] = useState<Segment>('baru');

  return (
    <ScreenContainer>
      <Text style={styles.header}>Pengajuan</Text>
      <View style={styles.segmentWrap}>
        <SegmentedControl<Segment>
          onChange={setSegment}
          options={[
            { value: 'baru', label: 'Buat Baru' },
            { value: 'kuota', label: 'Sisa Kuota' },
            { value: 'riwayat', label: 'Pengajuanku' },
          ]}
          value={segment}
        />
      </View>

      {segment === 'baru' ? <NewRequestForm /> : null}
      {segment === 'kuota' ? <QuotaTab /> : null}
      {segment === 'riwayat' ? <MyRequestsTab /> : null}
    </ScreenContainer>
  );
}

/** --- Segmen: Buat Baru --- */
function NewRequestForm() {
  const [type, setType] = useState<RequestType>('cuti');
  const [startDate, setStartDate] = useState('14 Okt 2026');
  const [endDate, setEndDate] = useState('15 Okt 2026');
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!reason.trim()) {
      setError('Alasan wajib diisi.');
      return;
    }
    if (type === 'sakit' && !file) {
      setError('Pengajuan sakit wajib melampirkan surat dokter.');
      return;
    }
    setError(null);
    showToast('Pengajuan terkirim ke PIC.');
    setReason('');
    setFile(null);
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Jenis Pengajuan</Text>
      <View style={styles.typeRow}>
        {(Object.keys(TYPE_CARD) as RequestType[]).map((t) => {
          const c = TYPE_CARD[t];
          const active = type === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.typeCard,
                { backgroundColor: c.bg },
                active && { borderColor: c.fg, borderWidth: 2 },
              ]}
            >
              <AppIcon color={c.fg} name={c.icon} size={26} />
              <Text style={[styles.typeLabel, { color: c.fg }]}>
                {TYPE_LABEL[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {type === 'ijin' ? (
        <View style={styles.halfRow}>
          <View>
            <Text style={styles.halfLabel}>Setengah hari</Text>
            <Text style={styles.halfHint}>Memotong 0,5 kuota ijin</Text>
          </View>
          <Switch
            onValueChange={setHalfDay}
            trackColor={{ false: colors.line, true: colors.yellowRing }}
            value={halfDay}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Rentang Tanggal</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <Text style={styles.fieldLabel}>Dari</Text>
          <TextInput
            onChangeText={setStartDate}
            style={styles.input}
            value={startDate}
          />
        </View>
        <View style={styles.dateCol}>
          <Text style={styles.fieldLabel}>Sampai</Text>
          <TextInput
            onChangeText={setEndDate}
            style={styles.input}
            value={endDate}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Alasan</Text>
      <TextInput
        multiline
        numberOfLines={4}
        onChangeText={setReason}
        placeholder="Tulis alasan pengajuan…"
        placeholderTextColor={colors.ink3}
        style={[styles.input, styles.textarea]}
        textAlignVertical="top"
        value={reason}
      />

      {type === 'sakit' ? (
        <View>
          <Text style={styles.sectionTitle}>
            Surat Dokter <Text style={styles.required}>*wajib</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setFile('surat-dokter.pdf')}
            style={styles.uploadZone}
          >
            <AppIcon color={colors.red} name="paperclip" size={22} style={styles.uploadIcon} />
            <Text style={styles.uploadText}>
              {file ?? 'Ketuk untuk melampirkan surat dokter'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.infoBanner, styles.bannerRow]}>
        <AppIcon color={colors.blue} name="info" size={18} style={styles.bannerIcon} />
        <Text style={[styles.infoText, styles.bannerText]}>
          Pengajuan diteruskan ke PIC Anda untuk persetujuan.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <AppIcon color={colors.red} name="alert_triangle" size={18} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ThemedButton
        onPress={handleSubmit}
        style={styles.submit}
        title="Kirim Pengajuan"
      />
    </View>
  );
}

/** --- Segmen: Sisa Kuota --- */
function QuotaTab() {
  return (
    <View>
      {QUOTAS.map((q) => {
        const c = TYPE_CARD[q.type];
        const progress = q.total !== null ? q.used / q.total : 0.25;
        return (
          <View key={q.type} style={styles.quotaCard}>
            <View style={styles.quotaTop}>
              <View style={[styles.quotaIcon, { backgroundColor: c.bg }]}>
                <AppIcon color={c.fg} name={c.icon} size={24} />
              </View>
              <View style={styles.quotaText}>
                <Text style={styles.quotaTitle}>{TYPE_LABEL[q.type]}</Text>
                <Text style={styles.quotaSub}>{q.usedLabel}</Text>
              </View>
              <Text style={[styles.quotaNum, { color: c.fg }]}>
                {q.total !== null ? `${q.total - q.used}` : '∞'}
              </Text>
            </View>
            <ProgressBar barColor={c.fg} progress={progress} />
          </View>
        );
      })}
      <Text style={styles.sectionTitle}>Riwayat Pemakaian</Text>
      <View style={styles.usageCard}>
        <UsageRow label="Cuti • 10–12 Nov 2026" value="Menunggu" tone="yellow" />
        <UsageRow label="Ijin • 3 Okt 2026" value="Disetujui" tone="green" />
        <UsageRow label="Sakit • 28 Sep 2026" value="Disetujui" tone="green" />
      </View>
    </View>
  );
}

function UsageRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'yellow' | 'green' | 'red';
}) {
  return (
    <View style={styles.usageRow}>
      <Text style={styles.usageLabel}>{label}</Text>
      <StatusChip label={value} tone={tone} />
    </View>
  );
}

/** --- Segmen: Pengajuanku --- */
function MyRequestsTab() {
  return (
    <View>
      {MY_REQUESTS.map((r) => (
        <RequestRow key={r.id} request={r} />
      ))}
    </View>
  );
}

export function RequestRow({ request }: { request: LeaveRequest }) {
  const employee = getEmployee(request.employeeId);
  return (
    <View style={styles.reqItem}>
      <Avatar gradientId={employee.gradientId} name={employee.name} size={44} />
      <View style={styles.reqText}>
        <Text style={styles.reqTitle}>
          {TYPE_LABEL[request.type]} • {request.dateRange}
        </Text>
        <Text style={styles.reqSub} numberOfLines={1}>
          {request.reason}
        </Text>
        <Text style={styles.reqDate}>{request.submittedAt}</Text>
      </View>
      <StatusChip
        label={STATUS_LABEL[request.status]}
        tone={REQ_STATUS_TONE[request.status]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 19,
    marginTop: spacing.sm,
  },
  segmentWrap: { marginTop: spacing.md },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeCard: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 16,
    flex: 1,
    paddingVertical: spacing.md,
  },
  typeGlyph: { fontSize: 26 },
  typeLabel: { fontFamily: fontFamily('700'), fontSize: 13, marginTop: 6 },
  halfRow: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  halfLabel: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  halfHint: { color: colors.ink2, fontFamily: fontFamily('400'), fontSize: 12, marginTop: 2 },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateCol: { flex: 1 },
  fieldLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.line,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textarea: { minHeight: 100 },
  required: { color: colors.red, fontSize: 12 },
  uploadZone: {
    alignItems: 'center',
    backgroundColor: colors.redBg,
    borderColor: colors.red,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  uploadIcon: { marginRight: 10 },
  uploadText: { color: colors.red, fontFamily: fontFamily('600'), fontSize: 13 },
  infoBanner: {
    backgroundColor: colors.blueBg,
    borderRadius: radius.input,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  infoText: { color: colors.blue, fontFamily: fontFamily('500'), fontSize: 12.5 },
  bannerRow: { alignItems: 'center', flexDirection: 'row' },
  bannerIcon: { marginRight: 10 },
  bannerText: { flex: 1 },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: colors.redBg,
    borderRadius: radius.input,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  errorIcon: { marginRight: 8 },
  errorText: { color: colors.red, flex: 1, fontFamily: fontFamily('600'), fontSize: 13 },
  submit: { marginTop: spacing.lg },
  quotaCard: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  quotaTop: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  quotaIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  quotaGlyph: { fontSize: 24 },
  quotaText: { flex: 1, marginLeft: 12 },
  quotaTitle: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 15 },
  quotaSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  quotaNum: { fontFamily: fontFamily('800'), fontSize: 22 },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: radius.card,
    padding: spacing.md,
  },
  usageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  usageLabel: { color: colors.ink, fontFamily: fontFamily('500'), fontSize: 13 },
  reqItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  reqText: { flex: 1, marginLeft: 12 },
  reqTitle: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 13.5 },
  reqSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  reqDate: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 2,
  },
});
