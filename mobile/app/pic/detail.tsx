import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RequestDetail } from '../../src/components/RequestDetail';
import { PIC_REQUESTS } from '../../src/data/demo';
import { colors, fontFamily } from '../../src/theme';

/** Detail Pengajuan (PIC) — tanpa tab bar, tombol kembali ke daftar. */
export default function PicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = PIC_REQUESTS.find((r) => r.id === id);

  if (!request) {
    return (
      <SafeAreaView style={styles.fallback}>
        <Text style={styles.fallbackText}>Pengajuan tidak ditemukan.</Text>
      </SafeAreaView>
    );
  }

  return <RequestDetail request={request} title="Detail Pengajuan" />;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
  },
  fallbackText: { color: colors.ink2, fontFamily: fontFamily('500') },
});
