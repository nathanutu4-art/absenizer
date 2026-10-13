import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlateButton } from './PlateButton';
import { colors, fontFamily, serifFamily, spacing } from '../theme';

interface State {
  hasError: boolean;
}

/**
 * Penangkap galat render: di build release, galat tak tertangkap membuat
 * aplikasi mati total. Boundary ini menampilkan layar ramah dengan opsi
 * kembali ke beranda, bukan crash.
 */
export class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // Sengaja tidak melempar ulang — cukup tampilkan layar aman.
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.title}>Terjadi gangguan</Text>
          <View style={styles.rule} />
          <Text style={styles.sub}>
            Aplikasi menemui masalah tak terduga. Coba kembali — data Anda
            aman.
          </Text>
          <PlateButton onPress={this.handleReset} variant="primary">
            Coba Lagi
          </PlateButton>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, flex: 1 },
  safe: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontFamily: serifFamily('800'),
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  rule: { backgroundColor: colors.ink, height: 3, marginBottom: spacing.md },
  sub: {
    color: colors.ink2,
    fontFamily: fontFamily('500'),
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
});
