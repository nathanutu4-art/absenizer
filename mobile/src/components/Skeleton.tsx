import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  /** Lebar placeholder (angka atau persen, mis. "100%" atau 140). */
  width?: number | `${number}%`;
  /** Tinggi placeholder. */
  height?: number;
  /** Radius sudut. */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton loading gaya ukiran: plat kertas krem dengan denyut halus.
 * Dipakai sebagai placeholder saat data dari Supabase sedang dimuat.
 */
export function Skeleton({ width = '100%', height = 16, borderRadius = 3, style }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <Animated.View
      style={[
        styles.bone,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.paper2,
    borderColor: colors.line,
    borderWidth: 1,
  },
});
