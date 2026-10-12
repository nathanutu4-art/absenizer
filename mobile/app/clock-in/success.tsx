import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { StatusChip } from '../../src/components/StatusChip';
import { ThemedButton } from '../../src/components/ThemedButton';
import { FLAG_LABELS, type FlagType } from '../../src/lib/businessRules';
import { colors, spacing, typography } from '../../src/theme';

/**
 * Langkah 4: layar sukses setelah clock in/out tersimpan.
 * Menampilkan penanda (bila ada) agar karyawan tahu catatannya berpenanda.
 */
export default function SuccessScreen() {
  const { kind, flags } = useLocalSearchParams<{
    kind?: string;
    flags?: string;
  }>();
  const clockKind = kind === 'out' ? 'Out' : 'In';
  const flagList = (flags ? flags.split(',').filter(Boolean) : []) as FlagType[];

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={styles.check}>✓</Text>
        <Text style={typography.title}>Clock {clockKind} Berhasil</Text>
        <Text style={typography.body}>
          Kehadiran Anda telah tercatat
          {flagList.length > 0 ? ' dengan penanda berikut:' : '.'}
        </Text>
        {flagList.length > 0 ? (
          <View style={styles.flags}>
            {flagList.map((f) => (
              <StatusChip key={f} flag={f} />
            ))}
          </View>
        ) : null}
        <Text style={typography.caption}>
          {flagList.length > 0
            ? `Penanda (${flagList.map((f) => FLAG_LABELS[f]).join(', ')}) diteruskan ke HR/PIC untuk ditinjau.`
            : 'Tidak ada penanda pada absensi ini.'}
        </Text>
      </View>
      <ThemedButton
        title="Kembali ke Beranda"
        onPress={() => router.replace('/(tabs)/home')}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.lg },
  center: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  check: {
    backgroundColor: colors.successSoft,
    borderRadius: 40,
    color: colors.success,
    fontSize: 40,
    height: 80,
    lineHeight: 80,
    textAlign: 'center',
    width: 80,
  },
  flags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
});
