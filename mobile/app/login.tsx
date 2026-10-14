import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../src/theme';

/** Uji isolasi: ScrollView + TextInput. */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Uji Form</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Email perusahaan</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="username"
          placeholderTextColor={colors.ink3}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Kata sandi</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.ink3}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Text style={styles.sub}>Jika form tampil dan bisa diketik, aman.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.etch,
    borderRadius: 3,
    borderWidth: 1.5,
    color: colors.ink,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  label: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  root: { backgroundColor: '#f7f2e7', flex: 1, padding: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  sub: { color: '#5a5245', fontSize: 14, marginTop: 16, textAlign: 'center' },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '700', marginBottom: 8 },
});
