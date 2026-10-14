import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Home minimal untuk uji navigasi tab (sementara). */
export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Home (uji)</Text>
      <Text style={styles.sub}>Jika layar ini tampil, navigasi ke tab berfungsi.</Text>
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
  sub: { color: '#5a5245', fontSize: 14, marginTop: 8, textAlign: 'center' },
  title: { color: '#1a1a1a', fontSize: 24, fontWeight: '700' },
});
