import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Bila true, konten bisa di-scroll (default true). */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pembungkus layar standar: latar aman + padding konsisten. */
export function ScreenContainer({ children, scroll = true, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
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
  safe: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
});
