import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import { Plate } from '../../src/components/Plate';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StampChip } from '../../src/components/StampChip';
import { EMPLOYEES, type Employee } from '../../src/data/demo';
import { colors, fontFamily, serifFamily, spacing } from '../../src/theme';

const STATUS_LABEL: Record<Employee['status'], string> = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  cuti: 'Cuti',
  ijin: 'Ijin',
};

const STATUS_TONE = {
  hadir: 'green',
  sakit: 'red',
  cuti: 'blue',
  ijin: 'yellow',
} as const;

const STAMP_COLORS = {
  green: { color: colors.green, bg: colors.greenBg },
  yellow: { color: colors.yellowText, bg: colors.yellowBg },
  blue: { color: colors.blue, bg: colors.blueBg },
  red: { color: colors.red, bg: colors.redBg },
} as const;

interface Birthday {
  employee: Employee;
  daysLeft: number;
  turningAge: number;
  dateLabel: string;
}

function upcomingBirthdays(): Birthday[] {
  const now = new Date();
  const list: Birthday[] = EMPLOYEES.map((e) => {
    const [y = 0, m = 1, d = 1] = e.birthISO.split('-').map(Number);
    const thisYear = new Date(now.getFullYear(), m - 1, d);
    const next =
      thisYear.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        ? thisYear
        : new Date(now.getFullYear() + 1, m - 1, d);
    const daysLeft = Math.round(
      (next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
        86400000,
    );
    const turningAge = next.getFullYear() - y;
    const dateLabel = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(next);
    return { employee: e, daysLeft, turningAge, dateLabel };
  });
  return list.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);
}

function awayRingColor(status: Employee['status']): string {
  return status === 'sakit'
    ? colors.red
    : status === 'cuti'
      ? colors.blue
      : colors.yellowRing;
}

/** Info Karyawan — tidak masuk, ulang tahun terdekat, direktori. */
export default function TeamScreen() {
  const [query, setQuery] = useState('');
  const birthdays = useMemo(upcomingBirthdays, []);
  const away = EMPLOYEES.filter((e) => e.status !== 'hadir');
  const directory = EMPLOYEES.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ScreenContainer>
      <Text style={styles.header}>Info Karyawan</Text>
      <View style={styles.doubleRule}>
        <View style={styles.ruleThick} />
        <View style={styles.ruleThin} />
      </View>

      {/* Sedang tidak masuk */}
      <SectionTitle label="Sedang Tidak Masuk" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.awayRow}>
        {away.map((e) => (
          <TouchableOpacity
            key={e.id}
            onPress={() => router.push(`/employee/${e.id}`)}
            style={styles.awayItem}
          >
            <View
              style={[styles.awayRing, { borderColor: awayRingColor(e.status) }]}
            >
              <MedallionIcon glyph="user" size={48} />
            </View>
            <Text style={styles.awayName} numberOfLines={1}>
              {e.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.legend}>
        <LegendDot color={colors.red} label="Sakit" />
        <LegendDot color={colors.blue} label="Cuti" />
        <LegendDot color={colors.yellowRing} label="Ijin" />
      </View>

      {/* Ulang tahun terdekat */}
      <SectionTitle label="Ulang Tahun Terdekat" />
      <View style={styles.birthGrid}>
        {birthdays.map((b) => (
          <Plate key={b.employee.id} style={styles.birthCard}>
            <View style={styles.birthInner}>
              <Avatar gradientId={b.employee.gradientId} name={b.employee.name} size={38} />
              <Text style={styles.birthName} numberOfLines={1}>
                {b.employee.name.split(' ')[0]}
              </Text>
              <Text style={styles.birthDate}>{b.dateLabel}</Text>
              <View style={styles.agePill}>
                <Text style={styles.ageText}>{b.turningAge} thn</Text>
              </View>
              <Text style={styles.countdown}>
                {b.daysLeft === 0 ? 'Hari ini!' : `${b.daysLeft} hari lagi`}
              </Text>
            </View>
          </Plate>
        ))}
      </View>

      {/* Direktori */}
      <SectionTitle label="Direktori Karyawan" />
      <View style={styles.searchRow}>
        <MedallionIcon glyph="search" size={32} style={styles.searchMedal} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Cari nama karyawan…"
          placeholderTextColor={colors.ink3}
          style={styles.searchInput}
          value={query}
        />
      </View>
      {directory.map((e) => {
        const stamp = STAMP_COLORS[STATUS_TONE[e.status]];
        return (
          <Plate key={e.id} style={styles.dirWrap}>
            <TouchableOpacity
              onPress={() => router.push(`/employee/${e.id}`)}
              style={styles.dirRow}
            >
              <Avatar gradientId={e.gradientId} name={e.name} size={46} />
              <View style={styles.dirText}>
                <Text style={styles.dirName}>{e.name}</Text>
                <Text style={styles.dirPos}>{e.position}</Text>
              </View>
              <StampChip color={stamp.color} backgroundColor={stamp.bg}>
                {STATUS_LABEL[e.status]}
              </StampChip>
            </TouchableOpacity>
          </Plate>
        );
      })}
    </ScreenContainer>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.ruleThick} />
      <View style={styles.ruleThin} />
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 22,
    marginTop: spacing.sm,
  },
  doubleRule: { marginTop: spacing.sm },
  ruleThick: { backgroundColor: colors.ink, height: 3 },
  ruleThin: { backgroundColor: colors.ink, height: 1, marginTop: 3 },
  sectionHead: { marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 15,
    marginBottom: 6,
  },
  awayRow: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  awayItem: { alignItems: 'center', marginRight: 14, width: 72 },
  awayRing: {
    borderRadius: 34,
    borderWidth: 3,
    padding: 3,
  },
  awayName: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 11,
    marginTop: 6,
  },
  legend: { flexDirection: 'row', marginTop: spacing.sm },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  legendDot: {
    borderColor: colors.etch,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 12,
    width: 12,
  },
  legendLabel: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 12,
    marginLeft: 6,
  },
  birthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  birthCard: { width: '31%' },
  birthInner: { alignItems: 'center', padding: spacing.sm },
  birthName: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12,
    marginTop: 6,
  },
  birthDate: { color: colors.ink2, fontFamily: fontFamily('500'), fontSize: 11 },
  agePill: {
    backgroundColor: colors.paper2,
    borderColor: colors.etch,
    borderRadius: 2,
    borderWidth: 1.5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ageText: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 11 },
  countdown: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 10.5,
    marginTop: 4,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: colors.plate,
    borderColor: colors.etch,
    borderRadius: 3,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchMedal: { marginRight: 8 },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 8,
  },
  dirWrap: { marginBottom: spacing.sm },
  dirRow: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  dirText: { flex: 1, marginLeft: 12 },
  dirName: { color: colors.ink, fontFamily: fontFamily('700'), fontSize: 14 },
  dirPos: {
    color: colors.ink2,
    fontFamily: fontFamily('400'),
    fontSize: 12,
    marginTop: 2,
  },
});
