import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Layar login minimal untuk uji navigasi (sementara). */
export default function LoginScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Login (uji)</Text>
      <Text style={styles.sub}>Jika layar ini tampil, navigasi berfungsi.</Text>
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
  title: { color: '#1a1a1a', fontSize: 24, fontWeight: '700' },
});
