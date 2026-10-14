import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ILLUSTRATION_LOGIN } from '../src/data/illustrations-login';

/** Uji isolasi: ilustrasi login 101KB. */
export default function LoginScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Uji Ilustrasi Login</Text>
      <Image
        resizeMode="cover"
        source={{ uri: ILLUSTRATION_LOGIN }}
        style={styles.art}
      />
      <Text style={styles.sub}>Jika gambar tampil, ilustrasi aman.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { height: 150, marginVertical: 16, width: '90%' },
  root: {
    alignItems: 'center',
    backgroundColor: '#f7f2e7',
    flex: 1,
    justifyContent: 'center',
  },
  sub: { color: '#5a5245', fontSize: 14 },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '700' },
});
