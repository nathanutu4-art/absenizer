import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ThemedButton } from '../../src/components/ThemedButton';
import { supabase } from '../../src/lib/supabase';
import { colors, radius, spacing, typography } from '../../src/theme';

/**
 * Profil karyawan: keterangan karyawan + info PIC.
 * Bila dibuka dengan param `name` (dari halaman Tim), tampilkan profil
 * karyawan tersebut dalam mode lihat-saja.
 *
 * TODO (Fase 1): ambil dari employee_profiles (nomor karyawan, jabatan,
 * tanggal lahir, email, no. telp, tanggal masuk -> lama bekerja) + info PIC.
 */
export default function ProfileScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const isViewingOther = typeof name === 'string' && name.length > 0;
  const displayName = isViewingOther ? name : 'Nama Karyawan';

  const rows: Array<[string, string]> = [
    ['Nomor karyawan', 'K-2024-0117'],
    ['Jabatan', 'Staf Operasional'],
    ['Tanggal lahir', '12 Mei 1994'],
    ['Email', 'karyawan@perusahaan.co.id'],
    ['No. telepon', '0812-3456-7890'],
    ['Lama bekerja', '2 tahun 4 bulan'],
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('absenizer_session');
    router.replace('/login');
  }

  function confirmLogout() {
    Alert.alert('Keluar', 'Yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: handleLogout },
    ]);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Avatar name={displayName} size={72} />
        <Text style={typography.title}>{displayName}</Text>
      </View>

      <Text style={[typography.subtitle, styles.section]}>Keterangan Karyawan</Text>
      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={typography.caption}>{label}</Text>
            <Text style={typography.body}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={[typography.subtitle, styles.section]}>Info PIC</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={typography.caption}>Nama</Text>
          <Text style={typography.body}>Sari Wulandari</Text>
        </View>
        <View style={styles.row}>
          <Text style={typography.caption}>Jabatan</Text>
          <Text style={typography.body}>Supervisor Tim Operasional</Text>
        </View>
        <View style={styles.row}>
          <Text style={typography.caption}>Kontak</Text>
          <Text style={typography.body}>sari@perusahaan.co.id</Text>
        </View>
      </View>

      {!isViewingOther ? (
        <>
          <ThemedButton
            title="Hubungi PIC"
            variant="outline"
            onPress={() =>
              Alert.alert('Hubungi PIC', 'Membuka kontak Sari Wulandari…')
            }
            style={styles.button}
          />
          <ThemedButton
            title="Keluar"
            variant="danger"
            onPress={confirmLogout}
            style={styles.button}
          />
        </>
      ) : null}
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
    padding: spacing.md,
  },
  header: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  row: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    gap: 2,
    paddingVertical: spacing.sm,
  },
  section: { marginBottom: spacing.sm, marginTop: spacing.lg },
});
