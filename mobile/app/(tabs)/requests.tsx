import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ParticleBackground, type ParticleHandle } from '../../src/components/ParticleBackground';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon, type MedallionVariant } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { PlateButton } from '../../src/components/PlateButton';
import { StampChip } from '../../src/components/StampChip';
import { showToast } from '../../src/components/Toast';
import { HATCH_TILE } from '../../src/data/medallions';
import type { IconName } from '../../src/data/icons';
import {
  MY_REQUESTS,
  QUOTAS,
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  type Employee,
  type LeaveRequest,
  type Quota,
  type RequestStatus,
  type RequestType,
} from '../../src/data/demo';
import { getCompanySettings, getEmployees, getMyEmployeeId, getMyLeaveBalance, getMyLeaveRequests, submitLeaveRequest } from '../../src/lib/db';
import { getSession } from '../../src/lib/session';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

type Segment = 'baru' | 'kuota' | 'riwayat';

const TYPE_CARD: Record<RequestType, { bg: string; fg: string; icon: IconName; variant: MedallionVariant }> = {
  cuti: { bg: colors.blueBg, fg: colors.blue, icon: 'umbrella', variant: 'wadaApricot' },
  ijin: { bg: colors.yellowBg, fg: colors.yellowText, icon: 'clipboard', variant: 'wadaOlive' },
  sakit: { bg: colors.redBg, fg: colors.red, icon: 'thermometer', variant: 'wadaIndigo' },
};

const REQ_STATUS_CHIP: Record<RequestStatus, { color: string; backgroundColor: string }> = {
  menunggu: { color: colors.yellowText, backgroundColor: colors.yellowBg },
  disetujui: { color: colors.green, backgroundColor: colors.greenBg },
  ditolak: { color: colors.red, backgroundColor: colors.redBg },
};

/** Judul seksi ukiran: serif + garis ganda di bawah. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.secWrap}>
      <Text style={styles.secTitle}>{children}</Text>
      <View style={styles.ruleThick} />
      <View style={styles.ruleThin} />
    </View>
  );
}

/** Pengajuan — Buat Baru / Sisa Kuota / Pengajuanku. */
export default function RequestsScreen() {
  const [segment, setSegment] = useState<Segment>('baru');
  // Partikel background interaktif (seperti dashboard).
  const particles = useRef<ParticleHandle | null>(null);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  // Daftar "Pengajuanku": data real bila tersedia, demo saat memuat/kosong.
  const [requests, setRequests] = useState<LeaveRequest[]>(MY_REQUESTS);
  const [me, setMe] = useState<Employee | null>(null);

  const reloadRequests = useCallback(() => {
    getMyLeaveRequests().then((rows) => {
      if (rows.length > 0) setRequests(rows);
    });
  }, []);

  useEffect(() => {
    reloadRequests();
    (async () => {
      const empId = await getMyEmployeeId();
      if (!empId) return;
      const list = await getEmployees();
      setMe(list.find((e) => e.id === empId) ?? null);
    })();
  }, [reloadRequests]);

  return (
    <View
      style={styles.root}
      onTouchMove={(e) => {
        const t = e.nativeEvent.touches[0];
        if (!t) return;
        const last = lastTouch.current;
        if (last) {
          const vx = (t.pageX - last.x) * 0.6;
          const vy = (t.pageY - last.y) * 0.6;
          particles.current?.impulse(t.pageX, t.pageY, vx, vy);
        }
        lastTouch.current = { x: t.pageX, y: t.pageY };
      }}
      onTouchEnd={() => {
        lastTouch.current = null;
      }}
    >
      {/* Background putih dengan sentuhan gradient lembut */}
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
      {/* Partikel interaktif */}
      <ParticleBackground ref={particles} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.header}>Pengajuan</Text>
      <View style={styles.segmentWrap}>
        <StampTabs onChange={setSegment} value={segment} />
      </View>

      {segment === 'baru' ? <NewRequestForm onSubmitted={reloadRequests} /> : null}
      {segment === 'kuota' ? <QuotaTab /> : null}
      {segment === 'riwayat' ? <MyRequestsTab requests={requests} employee={me} /> : null}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Tiga tab gaya cap stempel. */
function StampTabs({
  value,
  onChange,
}: {
  value: Segment;
  onChange: (v: Segment) => void;
}) {
  const tabs: { value: Segment; label: string }[] = [
    { value: 'baru', label: 'Buat Baru' },
    { value: 'kuota', label: 'Sisa Kuota' },
    { value: 'riwayat', label: 'Pengajuanku' },
  ];
  return (
    <View style={styles.tabRow}>
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            activeOpacity={0.85}
            key={t.value}
            onPress={() => onChange(t.value)}
            style={styles.tabTouch}
          >
            <View style={[styles.tabChip, active ? styles.tabActive : styles.tabIdle]}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextIdle]}>
                {t.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** --- Segmen: Buat Baru --- */
const BULAN_PENDEK: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', Mei: '05', Jun: '06',
  Jul: '07', Agu: '08', Sep: '09', Okt: '10', Nov: '11', Des: '12',
};

/** "14 Okt 2026" -> "2026-10-14"; null bila format tak dikenali. */
function parseTanggalID(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (!m) return null;
  const mon = BULAN_PENDEK[(m[2] ?? '').slice(0, 3)];
  if (!mon) return null;
  return `${m[3] ?? ''}-${mon}-${(m[1] ?? '').padStart(2, '0')}`;
}

function NewRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [type, setType] = useState<RequestType>('cuti');
  const [startDate, setStartDate] = useState('14 Okt 2026');
  const [endDate, setEndDate] = useState('15 Okt 2026');
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (sending) return;
    if (!reason.trim()) {
      setError('Alasan wajib diisi.');
      return;
    }
    if (type === 'sakit' && !file) {
      setError('Pengajuan sakit wajib melampirkan surat dokter.');
      return;
    }
    const start = parseTanggalID(startDate);
    const end = parseTanggalID(endDate);
    if (!start || !end) {
      setError('Format tanggal tidak dikenali. Contoh: "14 Okt 2026".');
      return;
    }
    setError(null);
    setSending(true);
    try {
      // Best-effort ke Supabase; di mode demo kembalikan ok:false dan
      // lanjutkan perilaku demo (toast + reset form).
      await submitLeaveRequest({
        type,
        startDate: start,
        endDate: end,
        isHalfDay: type === 'ijin' && halfDay,
        reason: reason.trim(),
        attachmentUrl: file,
      });
      onSubmitted();
    } finally {
      setSending(false);
    }
    showToast('Pengajuan terkirim ke PIC.');
    setReason('');
    setFile(null);
  }

  return (
    <View>
      <SectionTitle>Jenis Pengajuan</SectionTitle>
      <View style={styles.typeRow}>
        {(Object.keys(TYPE_CARD) as RequestType[]).map((t) => {
          const c = TYPE_CARD[t];
          const active = type === t;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={t}
              onPress={() => setType(t)}
              style={styles.typeTouch}
            >
              <Plate glass
                shadowColor={active ? c.fg : undefined}
                style={styles.typePlate}
              >
                <View style={styles.typeInner}>
                  <MedallionIcon glyph={c.icon} size={48} variant={c.variant} />
                  <Text style={[styles.typeLabel, { color: active ? c.fg : colors.ink }]}>
                    {TYPE_LABEL[t]}
                  </Text>
                  {active ? (
                    <View style={[styles.typeRule, { backgroundColor: c.fg }]} />
                  ) : null}
                </View>
              </Plate>
            </TouchableOpacity>
          );
        })}
      </View>

      {type === 'ijin' ? (
        <Plate glass style={styles.halfPlate}>
          <View style={styles.platePad}>
            <View style={styles.halfInner}>
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
          </View>
        </Plate>
      ) : null}

      <SectionTitle>Rentang Tanggal</SectionTitle>
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

      <SectionTitle>Alasan</SectionTitle>
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
          <SectionTitle>
            Surat Dokter <Text style={styles.required}>*wajib</Text>
          </SectionTitle>
          <TouchableOpacity onPress={() => setFile('surat-dokter.pdf')}>
            <Plate glass>
              <View style={styles.uploadInner}>
                <MedallionIcon glyph="paperclip" size={40} />
                <Text style={styles.uploadText}>
                  {file ?? 'Ketuk untuk melampirkan surat dokter'}
                </Text>
              </View>
            </Plate>
          </TouchableOpacity>
        </View>
      ) : null}

      <Plate glass style={styles.infoPlate}>
        <View style={styles.platePad}>
          <View style={styles.bannerRow}>
            <MedallionIcon glyph="info" size={40} />
            <Text style={[styles.infoText, styles.bannerText]}>
              Pengajuan diteruskan ke PIC Anda untuk persetujuan.
            </Text>
          </View>
        </View>
      </Plate>

      {error ? (
        <Plate glass style={styles.errorPlate}>
          <View style={styles.platePad}>
            <View style={styles.bannerRow}>
              <MedallionIcon glyph="alert_triangle" size={40} />
              <Text style={[styles.errorText, styles.bannerText]}>{error}</Text>
            </View>
          </View>
        </Plate>
      ) : null}

      <PlateButton onPress={handleSubmit} style={styles.submit} variant="primary">
        {sending ? 'Mengirim…' : 'Kirim Pengajuan'}
      </PlateButton>
    </View>
  );
}

/** Bilah progres berarsir untuk kuota. */
function HatchBar({ progress, color }: { progress: number; color: string }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.hatchTrack}>
      <View style={[styles.hatchFill, { width: `${pct * 100}%` }]}>
        <Image
          resizeMode="repeat"
          source={{ uri: HATCH_TILE }}
          style={StyleSheet.absoluteFill}
          tintColor={color}
        />
      </View>
    </View>
  );
}

/** --- Segmen: Sisa Kuota --- */
function QuotaTab() {
  // Sesi demo: QUOTAS demo. Sesi real: saldo dari database (leave_balances),
  // fallback ke default dari company_settings bila baris belum ada.
  const [quotas, setQuotas] = useState<Quota[]>(QUOTAS);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getSession();
        if (s?.demo !== false) return;
        const [balance, settings] = await Promise.all([
          getMyLeaveBalance(),
          getCompanySettings(),
        ]);
        if (!alive) return;
        const cutiQuota = balance?.cutiQuota ?? settings.cutiQuotaDefault;
        const cutiUsed = balance?.cutiUsed ?? 0;
        const ijinQuota = balance?.ijinQuota ?? settings.ijinQuotaDefault;
        const ijinUsed = balance?.ijinUsed ?? 0;
        const fmt = (n: number) =>
          Number.isInteger(n) ? String(n) : n.toLocaleString('id-ID');
        setQuotas([
          {
            type: 'cuti',
            used: cutiUsed,
            total: cutiQuota,
            usedLabel: `Terpakai ${fmt(cutiUsed)} dari ${fmt(cutiQuota)} hari`,
          },
          {
            type: 'ijin',
            used: ijinUsed,
            total: ijinQuota,
            usedLabel: `Terpakai ${fmt(ijinUsed)} dari ${fmt(ijinQuota)}`,
          },
          {
            type: 'sakit',
            used: 0,
            total: null,
            usedLabel: 'Tanpa batas • wajib surat dokter',
          },
        ]);
      } catch {
        // Tetap tampilkan angka demo bila gagal — jangan kosong.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View>
      {quotas.map((q) => {
        const c = TYPE_CARD[q.type];
        const progress = q.total !== null ? q.used / q.total : 0.25;
        return (
          <Plate glass key={q.type} style={styles.quotaPlate}>
            <View style={styles.platePad}>
              <View style={styles.quotaTop}>
              <MedallionIcon glyph={c.icon} size={52} variant={c.variant} />
              <View style={styles.quotaText}>
                <Text style={styles.quotaTitle}>{TYPE_LABEL[q.type]}</Text>
                <Text style={styles.quotaSub}>{q.usedLabel}</Text>
              </View>
              <Text style={[styles.quotaNum, { color: c.fg }]}>
                {q.total !== null ? `${q.total - q.used}` : '∞'}
              </Text>
            </View>
            <HatchBar color={c.fg} progress={progress} />
            </View>
          </Plate>
        );
      })}
      <SectionTitle>Riwayat Pemakaian</SectionTitle>
      <Plate glass style={styles.usagePlate}>
        <View style={styles.platePad}>
          <UsageRow label="Cuti • 10–12 Nov 2026" tone="menunggu" value="Menunggu" />
          <UsageRow label="Ijin • 3 Okt 2026" tone="disetujui" value="Disetujui" />
          <UsageRow label="Sakit • 28 Sep 2026" tone="disetujui" value="Disetujui" />
        </View>
      </Plate>
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
  tone: RequestStatus;
}) {
  const chip = REQ_STATUS_CHIP[tone];
  return (
    <View style={styles.usageRow}>
      <Text style={styles.usageLabel}>{label}</Text>
      <StampChip color={chip.color} backgroundColor={chip.backgroundColor}>
        {value}
      </StampChip>
    </View>
  );
}

/** --- Segmen: Pengajuanku --- */
function MyRequestsTab({
  requests,
  employee,
}: {
  requests: LeaveRequest[];
  employee: Employee | null;
}) {
  return (
    <View>
      {requests.map((r) => (
        <RequestRow key={r.id} request={r} employee={employee} />
      ))}
    </View>
  );
}

export function RequestRow({
  request,
  employee,
}: {
  request: LeaveRequest;
  employee?: Employee | null;
}) {
  let emp = employee ?? null;
  if (!emp) {
    try {
      emp = getEmployee(request.employeeId);
    } catch {
      emp = null;
    }
  }
  const chip = REQ_STATUS_CHIP[request.status];
  return (
    <Plate glass style={styles.reqPlate}>
      <View style={styles.platePad}>
        <View style={styles.reqInner}>
          <Avatar gradientId={emp?.gradientId ?? '01'} name={emp?.name ?? '?'} size={44} shape="square" />
          <View style={styles.reqText}>
            <Text style={styles.reqTitle}>
              {TYPE_LABEL[request.type]} • {request.dateRange}
            </Text>
            <Text style={styles.reqSub} numberOfLines={1}>
              {request.reason}
            </Text>
            <Text style={styles.reqDate}>{request.submittedAt}</Text>
          </View>
          <StampChip color={chip.color} backgroundColor={chip.backgroundColor}>
            {STATUS_LABEL[request.status]}
          </StampChip>
        </View>
      </View>
    </Plate>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 22,
    marginTop: spacing.sm,
  },
  segmentWrap: { marginTop: spacing.md, marginBottom: spacing.sm },
  secWrap: { marginBottom: spacing.sm, marginTop: spacing.lg },
  secTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    letterSpacing: 0.4,
  },
  ruleThick: { backgroundColor: colors.line, height: 3, marginTop: 6 },
  ruleThin: { backgroundColor: colors.line, height: 1, marginTop: 3 },
  platePad: { padding: spacing.md },
  tabRow: { flexDirection: 'row', gap: spacing.sm },
  tabTouch: { flex: 1 },
  tabChip: {
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 10,
    transform: [{ rotate: '-0.6deg' }],
  },
  tabActive: { backgroundColor: colors.etch, borderColor: colors.etchDeep },
  tabIdle: { backgroundColor: 'transparent', borderColor: '#d5dce8' },
  tabText: {
    fontFamily: fontFamily('700'),
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabTextActive: { color: colors.surface },
  tabTextIdle: { color: colors.ink2 },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeTouch: { flex: 1 },
  typePlate: { flex: 1 },
  typeInner: { alignItems: 'center', paddingVertical: spacing.md },
  typeLabel: {
    fontFamily: fontFamily('700'),
    fontSize: 13,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  typeRule: { borderRadius: 1, height: 2, marginTop: 6, width: 36 },
  halfPlate: { marginTop: spacing.md },
  halfInner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfLabel: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  halfHint: { color: colors.ink3, fontFamily: fontFamily('400'), fontSize: 12, marginTop: 2 },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateCol: { flex: 1 },
  fieldLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('600'),
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#f2f5fa',
    borderColor: '#d5dce8',
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textarea: { minHeight: 100 },
  required: { color: colors.red, fontSize: 12 },

  uploadInner: { alignItems: 'center', flexDirection: 'row', padding: spacing.md },
  uploadText: {
    color: colors.red,
    flex: 1,
    fontFamily: fontFamily('600'),
    fontSize: 13,
    marginLeft: 10,
  },
  infoPlate: { marginTop: spacing.lg },
  infoText: { color: colors.blue, fontFamily: fontFamily('500'), fontSize: 12.5 },
  bannerRow: { alignItems: 'center', flexDirection: 'row' },
  bannerText: { flex: 1, marginLeft: 10 },
  errorPlate: { marginTop: spacing.sm },
  errorText: { color: colors.red, fontFamily: fontFamily('600'), fontSize: 13 },
  submit: { marginBottom: spacing.lg, marginTop: spacing.lg },
  quotaPlate: { marginTop: spacing.md },
  quotaTop: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  quotaText: { flex: 1, marginLeft: 12 },
  quotaTitle: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 16 },
  quotaSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
  quotaNum: { fontFamily: serifFamily('800'), fontSize: 24 },
  hatchTrack: {
    backgroundColor: colors.paper2,
    borderColor: '#d5dce8',
    borderRadius: 3,
    borderWidth: 1.5,
    height: 14,
    overflow: 'hidden',
    width: '100%',
  },
  hatchFill: { height: '100%' },
  usagePlate: { marginBottom: spacing.lg },
  usageRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  usageLabel: { color: colors.ink, fontFamily: fontFamily('500'), fontSize: 13 },
  reqPlate: { marginTop: spacing.sm },
  reqInner: { alignItems: 'center', flexDirection: 'row' },
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
