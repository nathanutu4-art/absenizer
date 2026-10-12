import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../theme';

type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

/** Tampilkan toast global (2,6 detik, sesuai prototype). */
export function showToast(message: string): void {
  listeners.forEach((l) => l(message));
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Host toast — pasang sekali di root layout. */
export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(
    () =>
      subscribe((msg) => {
        setMessage(msg);
      }),
    [],
  );

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2600);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    alignItems: 'center',
    bottom: 104,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 13,
    maxWidth: '86%',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  text: { color: '#ffffff', fontFamily: fontFamily('700'), fontSize: 13 },
});
