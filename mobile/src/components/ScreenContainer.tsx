import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Bila true, konten bisa di-scroll (default true). */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Warna latar kustom (mis. layar gelap kamera). */
  backgroundColor?: string;
}

/** Pembungkus layar standar: latar aman + padding konsisten (mode terang tetap). */
export function ScreenContainer({
  children,
  scroll = true,
  style,
  backgroundColor = colors.bg,
}: Props) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
});
