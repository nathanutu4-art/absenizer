import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MedallionIcon } from '../src/components/MedallionIcon';

/** Uji isolasi: MedallionIcon. */
export default function LoginScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Uji MedallionIcon</Text>
      <MedallionIcon glyph="shield" size={60} variant="wadaIndigo" />
      <Text style={styles.sub}>Jika medali tampil, MedallionIcon aman.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#f7f2e7',
    flex: 1,
    justifyContent: 'center',
  },
  sub: { color: '#5a5245', fontSize: 14, marginTop: 8 },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '700', marginBottom: 16 },
});
