import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CLOCK_SKETCH } from '../data/clock-sketch';

interface Props {
  /** Diameter jam (px). */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * SketchClock — jam sketsa dengan jarum dinamis mengikuti waktu berjalan (WIB).
 * - Jarum panjang (menit): hitam
 * - Jarum pendek (jam): biru #0151b0 seperti background
 * - Gaya coretan: tiap jarum digambar ganda dengan offset kecil
 *   meniru goresan tangan yang tidak sempurna.
 */
export function SketchClock({ size = 120, style }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Konversi ke WIB (UTC+7)
  const wib = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);
  const minutes = wib.getMinutes() + wib.getSeconds() / 60;
  const hours = (wib.getHours() % 12) + minutes / 60;

  const minuteDeg = minutes * 6; // 360 / 60
  const hourDeg = hours * 30; // 360 / 12

  const center = size / 2;
  const minuteLen = size * 0.32;
  const hourLen = size * 0.22;
  const dotSize = Math.max(8, size * 0.07);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Muka jam sketsa */}
      <Image
        source={{ uri: CLOCK_SKETCH }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />

      {/* Jarum menit (panjang, hitam) — gaya coretan ganda */}
      <Hand
        angle={minuteDeg}
        center={center}
        length={minuteLen}
        width={4}
        color="#1a1a1a"
      />
      {/* Jarum jam (pendek, biru) — gaya coretan ganda */}
      <Hand
        angle={hourDeg}
        center={center}
        length={hourLen}
        width={5}
        color="#0151b0"
      />

      {/* Titik tengah */}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            left: center - dotSize / 2,
            top: center - dotSize / 2,
          },
        ]}
      />
    </View>
  );
}

/**
 * Satu jarum jam dengan efek coretan: garis utama + garis kedua
 * yang sedikit bergeser & lebih tipis, meniru goresan tangan.
 */
function Hand({
  angle,
  center,
  length,
  width,
  color,
}: {
  angle: number;
  center: number;
  length: number;
  width: number;
  color: string;
}) {
  const handStyle = (offsetX: number, w: number, opacity: number) => ({
    position: 'absolute' as const,
    left: center - w / 2 + offsetX,
    top: center - length,
    width: w,
    height: length,
    backgroundColor: color,
    opacity,
    borderTopLeftRadius: w / 2,
    borderTopRightRadius: w / 2,
    borderBottomLeftRadius: w / 3,
    borderBottomRightRadius: w / 3,
    transform: [
      { translateY: length / 2 },
      { rotate: `${angle}deg` },
      { translateY: -length / 2 },
    ],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Goresan kedua: offset, tipis, transparan — efek sketsa */}
      <View style={handStyle(1.5, Math.max(1.5, width * 0.45), 0.55)} />
      {/* Goresan utama */}
      <View style={handStyle(0, width, 1)} />
      {/* Goresan ketiga: offset berlawanan, sangat tipis */}
      <View style={handStyle(-1.2, Math.max(1, width * 0.3), 0.35)} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: '#1a1a1a',
    position: 'absolute',
  },
});
