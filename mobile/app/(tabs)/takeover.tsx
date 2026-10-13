import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StampChip } from '../../src/components/StampChip';
import {
  PIC_REQUESTS,
  TYPE_LABEL,
  getEmployee,
  type LeaveRequest,
} from '../../src/data/demo';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

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
        <StampChip color={colors.indigo} backgroundColor={colors.blueBg}>
          Mode HR
        </StampChip>
      </View>

      {/* Banner audit persisten */}
      <Plate style={styles.auditPlate}>
        <View style={styles.platePad}>
          <View style={styles.auditRow}>
          <MedallionIcon glyph="shield" size={52} />
          <View style={styles.auditText}>
            <StampChip color={colors.orange} backgroundColor={colors.orangeBg}>
              Audit
            </StampChip>
            <Text style={styles.auditTitle}>Penanda Audit Aktif</Text>
              <Text style={styles.auditSub}>
                Setiap keputusan pengambilalihan dicatat permanen dalam log audit.
              </Text>
            </View>
          </View>
        </View>
      </Plate>

      <SectionTitle>Bisa Diambil Alih (PIC belum merespons)</SectionTitle>
      {escalated.length === 0 ? (
        <Text style={styles.empty}>Tidak ada pengajuan eskalasi.</Text>
      ) : (
        escalated.map((r) => <TakeoverRow key={r.id} request={r} />)
      )}

      <SectionTitle>Sudah Diambil Alih</SectionTitle>
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
  const taken = !!request.takenOverBy;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/hr/detail?id=${request.id}`)}
    >
      <Plate style={styles.rowPlate}>
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
            <StampChip
              color={taken ? colors.blue : colors.orange}
              backgroundColor={taken ? colors.blueBg : colors.orangeBg}
            >
              {taken ? 'Diambil Alih' : 'Eskalasi'}
            </StampChip>
          </View>
        </View>
      </Plate>
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
  header: { color: colors.ink, fontFamily: serifFamily('800'), fontSize: 22 },
  auditPlate: { marginTop: spacing.md },
  platePad: { padding: spacing.md },
  auditRow: { alignItems: 'center', flexDirection: 'row' },
  auditText: { flex: 1, marginLeft: 12 },
  auditTitle: {
    color: colors.orange,
    fontFamily: serifFamily('800'),
    fontSize: 16,
    marginTop: 6,
  },
  auditSub: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 3,
  },
  secWrap: { marginBottom: spacing.sm, marginTop: spacing.lg },
  secTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    letterSpacing: 0.4,
  },
  ruleThick: { backgroundColor: colors.ink, height: 3, marginTop: 6 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  empty: {
    color: colors.ink3,
    fontFamily: fontFamily('400'),
    fontSize: 13,
    paddingVertical: spacing.sm,
  },
  rowPlate: { marginBottom: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row' },
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
