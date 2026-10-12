import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import { supabase } from '../../src/lib/supabase';
import { colors, radius, spacing, typography } from '../../src/theme';

interface TodayStatus {
  clockedIn: boolean;
  clockInTime: string | null;
  clockedOut: boolean;
}

/**
 * Beranda — status kehadiran hari ini + tombol Clock In/Out.
 * TODO (Fase 1): ambil status riil dari tabel attendance (filter tanggal hari ini
 * zona Asia/Jakarta) dan nama karyawan dari employee_profiles.
 */
export default function HomeScreen() {
  const [status, setStatus] = useState<TodayStatus>({
    clockedIn: false,
    clockInTime: null,
    clockedOut: false,
  });
  const [userName, setUserName] = useState('Karyawan');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) setUserName(data.user.email.split('@')[0] ?? 'Karyawan');
      // TODO: query attendance hari ini -> setStatus(...)
    })();
  }, []);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScreenContainer>
      <Text style={typography.caption}>{today}</Text>
      <Text style={typography.title}>Halo, {userName} 👋</Text>

      <View style={styles.card}>
        <Text style={typography.subtitle}>Status Hari Ini</Text>
        <Text style={typography.body}>
          {status.clockedIn
            ? `Sudah clock in pukul ${status.clockedIn ? status.clockInTime ?? '-' : '-'}`
            : 'Belum clock in hari ini.'}
        </Text>
        {status.clockedOut ? (
          <Text style={typography.body}>Anda sudah clock out. Sampai jumpa besok!</Text>
        ) : null}
      </View>

      {!status.clockedOut ? (
        <ThemedButton
          title={status.clockedIn ? 'Clock Out' : 'Clock In'}
          onPress={() =>
            router.push({
              pathname: '/clock-in/selfie',
              params: { kind: status.clockedIn ? 'out' : 'in' },
            })
          }
          style={styles.button}
        />
      ) : null}

      <ThemedButton
        title="Lihat Tim & Status Cuti"
        variant="outline"
        onPress={() => router.push('/(tabs)/team')}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
});
