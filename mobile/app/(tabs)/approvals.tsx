import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import {
  PIC_REQUESTS,
  STATUS_LABEL,
  TYPE_LABEL,
  getEmployee,
  type LeaveRequest,
} from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

/** Persetujuan PIC — daftar menunggu + yang sudah diputus. */
export default function ApprovalsScreen() {
  const pending = PIC_REQUESTS.filter((r) => r.status === 'menunggu');
  const decided = PIC_REQUESTS.filter((r) => r.status !== 'menunggu');

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Persetujuan</Text>
        <View style={styles.pendingChip}>
          <Text style={styles.pendingText}>{pending.length} Menunggu</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          ℹ️ Tinjau pengajuan dari anggota tim Anda. Penolakan wajib disertai
          catatan.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Menunggu Persetujuan</Text>
      {pending.map((r) => (
        <ApprovalRow key={r.id} request={r} />
      ))}

      <Text style={styles.sectionTitle}>Sudah Diputus</Text>
      {decided.map((r) => (
        <ApprovalRow key={r.id} request={r} />
      ))}
    </ScreenContainer>
  );
}

export function ApprovalRow({ request }: { request: LeaveRequest }) {
  const employee = getEmployee(request.employeeId);
  const tone =
    request.status === 'menunggu'
      ? 'yellow'
      : request.status === 'disetujui'
        ? 'green'
        : 'red';
  return (
    <TouchableOpacity
      onPress={() => router.push(`/pic/detail?id=${request.id}`)}
      style={styles.row}
    >
      <Avatar gradientId={employee.gradientId} name={employee.name} size={46} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{employee.name}</Text>
        <Text style={styles.rowDesc}>
          {TYPE_LABEL[request.type]} • {request.dateRange}
        </Text>
        <Text style={styles.rowDate}>{request.submittedAt}</Text>
      </View>
      <StatusChip label={STATUS_LABEL[request.status]} tone={tone} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  header: { color: colors.ink, fontFamily: fontFamily('800'), fontSize: 19 },
  pendingChip: {
    backgroundColor: colors.red,
    borderRadius: radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingText: { color: '#fff', fontFamily: fontFamily('700'), fontSize: 12 },
  infoCard: {
    backgroundColor: colors.blueBg,
    borderRadius: radius.input,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  infoText: { color: colors.blue, fontFamily: fontFamily('500'), fontSize: 12.5 },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  rowText: { flex: 1, marginLeft: 12 },
  rowName: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  rowDesc: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 12.5,
    marginTop: 2,
  },
  rowDate: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 11,
    marginTop: 2,
  },
});
