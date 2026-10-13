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
import { AppIcon } from '../../src/components/AppIcon';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { EMPLOYEES, type Employee } from '../../src/data/demo';
import { colors, fontFamily, radius, spacing } from '../../src/theme';

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

const PASTELS = ['#e9f0fe', '#fdf6e0', '#e8f7ee', '#fdeee2', '#fdeeee', '#eef2ff'];

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

      {/* Sedang tidak masuk */}
      <Text style={styles.sectionTitle}>Sedang Tidak Masuk</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.awayRow}>
        {away.map((e) => (
          <TouchableOpacity
            key={e.id}
            onPress={() => router.push(`/employee/${e.id}`)}
            style={styles.awayItem}
          >
            <Avatar gradientId={e.gradientId} name={e.name} size={56} statusRing={e.status === 'hadir' ? undefined : e.status} />
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
      <Text style={styles.sectionTitle}>Ulang Tahun Terdekat</Text>
      <View style={styles.birthGrid}>
        {birthdays.map((b, i) => (
          <View
            key={b.employee.id}
            style={[styles.birthCard, { backgroundColor: PASTELS[i % PASTELS.length] }]}
          >
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
        ))}
      </View>

      {/* Direktori */}
      <Text style={styles.sectionTitle}>Direktori Karyawan</Text>
      <View style={styles.searchRow}>
        <AppIcon color={colors.ink3} name="search" size={18} style={styles.searchIconImg} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Cari nama karyawan…"
          placeholderTextColor={colors.ink3}
          style={styles.searchInput}
          value={query}
        />
      </View>
      {directory.map((e) => (
        <TouchableOpacity
          key={e.id}
          onPress={() => router.push(`/employee/${e.id}`)}
          style={styles.dirRow}
        >
          <Avatar gradientId={e.gradientId} name={e.name} size={46} />
          <View style={styles.dirText}>
            <Text style={styles.dirName}>{e.name}</Text>
            <Text style={styles.dirPos}>{e.position}</Text>
          </View>
          <StatusChip label={STATUS_LABEL[e.status]} tone={STATUS_TONE[e.status]} />
        </TouchableOpacity>
      ))}
    </ScreenContainer>
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
    fontFamily: fontFamily('800'),
    fontSize: 19,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily('800'),
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  awayRow: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  awayItem: { alignItems: 'center', marginRight: 14, width: 64 },
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
  legendDot: { borderRadius: 6, height: 12, width: 12 },
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
  birthCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.sm,
    width: '31%',
  },
  birthName: {
    color: colors.ink,
    fontFamily: fontFamily('700'),
    fontSize: 12,
    marginTop: 6,
  },
  birthDate: { color: colors.ink2, fontFamily: fontFamily('500'), fontSize: 11 },
  agePill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.chip,
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
    backgroundColor: '#fff',
    borderRadius: radius.input,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: 12,
  },
  searchIconImg: { marginRight: 8 },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: 14,
    paddingVertical: 12,
  },
  dirRow: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: spacing.sm,
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
