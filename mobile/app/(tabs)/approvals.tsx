import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StampChip } from '../../src/components/StampChip';
import {
  PIC_REQUESTS,
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  type LeaveRequest,
  type RequestStatus,
} from '../../src/data/demo';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_CHIP: Record<RequestStatus, { color: string; backgroundColor: string }> = {
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

/** Persetujuan PIC — daftar menunggu + yang sudah diputus. */
export default function ApprovalsScreen() {
  const pending = PIC_REQUESTS.filter((r) => r.status === 'menunggu');
  const decided = PIC_REQUESTS.filter((r) => r.status !== 'menunggu');

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#ffffff', '#eef3fa']}
        style={StyleSheet.absoluteFill}
      />
      <ScreenContainer backgroundColor="transparent">
      <View style={styles.headerRow}>
        <Text style={styles.header}>Persetujuan</Text>
        <StampChip color={colors.red} backgroundColor={colors.redBg}>
          {pending.length} Menunggu
        </StampChip>
      </View>

      <Plate solidColor="rgba(2,85,179,0.85)" style={styles.infoPlate}>
        <View style={styles.platePad}>
          <View style={styles.infoRow}>
            <MedallionIcon glyph="info" size={40} variant="cream" />
            <Text style={[styles.infoText, styles.infoBody]}>
              Tinjau pengajuan dari anggota tim Anda. Penolakan wajib disertai
              catatan.
            </Text>
          </View>
        </View>
      </Plate>

      <SectionTitle>Menunggu Persetujuan</SectionTitle>
      {pending.map((r) => (
        <ApprovalRow key={r.id} request={r} />
      ))}

      <SectionTitle>Sudah Diputus</SectionTitle>
      {decided.map((r) => (
        <ApprovalRow key={r.id} request={r} />
      ))}
      </ScreenContainer>
    </View>
  );
}

export function ApprovalRow({ request }: { request: LeaveRequest }) {
  const employee = getEmployee(request.employeeId);
  const chip = STATUS_CHIP[request.status];
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/pic/detail?id=${request.id}`)}
    >
      <Plate solidColor="rgba(2,85,179,0.85)" style={styles.rowPlate}>
        <View style={styles.platePad}>
          <View style={styles.row}>
          <Avatar gradientId={employee.gradientId} name={employee.name} size={46} shape="square" />
          <View style={styles.rowText}>
            <Text style={styles.rowName}>{employee.name}</Text>
            <Text style={styles.rowDesc}>
              {TYPE_LABEL[request.type]} • {request.dateRange}
            </Text>
            <Text style={styles.rowDate}>{request.submittedAt}</Text>
            </View>
            <StampChip color={chip.color} backgroundColor={chip.backgroundColor}>
              {STATUS_LABEL[request.status]}
            </StampChip>
          </View>
        </View>
      </Plate>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#ffffff', flex: 1 },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  header: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 22 },
  infoPlate: { marginTop: spacing.md },
  platePad: { padding: spacing.md },
  infoRow: { alignItems: 'center', flexDirection: 'row' },
  infoText: { color: '#ffffff', fontFamily: fontFamily('500'), fontSize: 12.5 },
  infoBody: { flex: 1, marginLeft: 10 },
  secWrap: { marginBottom: spacing.sm, marginTop: spacing.lg },
  secTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    letterSpacing: 0.4,
  },
  ruleThick: { backgroundColor: colors.ink, height: 3, marginTop: 6 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  rowPlate: { marginBottom: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row' },
  rowText: { flex: 1, marginLeft: 12 },
  rowName: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 14 },
  rowDesc: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily('500'),
    fontSize: 12.5,
    marginTop: 2,
  },
  rowDate: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 2,
  },
});
