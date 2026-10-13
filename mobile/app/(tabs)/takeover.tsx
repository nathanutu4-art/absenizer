import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppIcon } from '../../src/components/AppIcon';
import { Avatar } from '../../src/components/Avatar';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import {
  PIC_REQUESTS,
  TYPE_LABEL,
  getEmployee,
  type LeaveRequest,
} from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

/**
 * Pengambilalihan HR — daftar eskalasi + banner audit persisten.
 * Semua keputusan di sini tercatat sebagai pengambilalihan teraudit.
 */
export default function TakeoverScreen() {
  const escalated = PIC_REQUESTS.filter(
    (r) => r.status === 'menunggu' && r.escalated,
  );
  const takenOver = PIC_REQUESTS.filter((r) => r.takenOverBy);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Pengambilalihan</Text>
        <View style={styles.modeChip}>
          <Text style={styles.modeText}>Mode HR</Text>
        </View>
      </View>

      {/* Banner audit persisten */}
      <View style={styles.auditBanner}>
        <AppIcon color={colors.orange} name="shield" size={28} style={styles.auditIcon} />
        <View style={styles.auditText}>
          <Text style={styles.auditTitle}>Penanda Audit Aktif</Text>
          <Text style={styles.auditSub}>
            Setiap keputusan pengambilalihan dicatat permanen dalam log audit.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Bisa Diambil Alih (PIC belum merespons)
      </Text>
      {escalated.length === 0 ? (
        <Text style={styles.empty}>Tidak ada pengajuan eskalasi.</Text>
      ) : (
        escalated.map((r) => <TakeoverRow key={r.id} request={r} />)
      )}

      <Text style={styles.sectionTitle}>Sudah Diambil Alih</Text>
      {takenOver.length === 0 ? (
        <Text style={styles.empty}>Belum ada pengambilalihan.</Text>
      ) : (
        takenOver.map((r) => <TakeoverRow key={r.id} request={r} />)
      )}
    </ScreenContainer>
  );
}

export function TakeoverRow({ request }: { request: LeaveRequest }) {
  const employee = getEmployee(request.employeeId);
  return (
    <TouchableOpacity
      onPress={() => router.push(`/hr/detail?id=${request.id}`)}
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
      <StatusChip
        label={request.takenOverBy ? 'Diambil Alih' : 'Eskalasi'}
        tone={request.takenOverBy ? 'blue' : 'orange'}
      />
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
  modeChip: {
    backgroundColor: colors.indigo,
    borderRadius: radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeText: { color: '#fff', fontFamily: fontFamily('700'), fontSize: 12 },
  auditBanner: {
    backgroundColor: colors.orangeBg,
    borderColor: colors.orange,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: spacing.md,
  },
  auditIcon: { marginRight: 12 },
  auditText: { flex: 1 },
  auditTitle: { color: colors.orange, fontFamily: fontFamily('800'), fontSize: 14 },
  auditSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 3,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  empty: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 13,
    paddingVertical: spacing.sm,
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
