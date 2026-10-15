import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
}

export interface ParticleHandle {
  /** Dorong partikel di sekitar titik (x, y) dengan kecepatan (vx, vy). */
  impulse: (x: number, y: number, vx: number, vy: number, radius?: number) => void;
}

interface Props {
  count?: number;
}

/**
 * ParticleBackground — partikel melayang yang bereaksi terhadap sentuhan.
 * - Render 60fps via requestAnimationFrame + setNativeProps (tanpa re-render).
 * - Partikel: drift lembut + friksi; impulse dari swipe mendorong partikel
 *   di sekitar titik sentuh.
 * - Kompatibel Expo Go (tanpa Skia / reanimated).
 */
export const ParticleBackground = forwardRef<ParticleHandle, Props>(function ParticleBackground(
  { count = 28 },
  ref,
) {
  const views = useRef<Array<View | null>>([]);
  const parts = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  // Inisialisasi partikel sekali.
  if (parts.current.length === 0) {
    for (let i = 0; i < count; i++) {
      parts.current.push({
        x: Math.random() * SW,
        y: Math.random() * SH,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 2 + Math.random() * 3.5,
        opacity: 0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  useImperativeHandle(ref, () => ({
    impulse(x, y, vx, vy, radius = 160) {
      for (const p of parts.current) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          // Falloff: makin dekat makin kuat.
          const f = (1 - dist / radius) * 0.35;
          p.vx += vx * f;
          p.vy += vy * f;
          // Batasi kecepatan maksimum.
          const sp = Math.hypot(p.vx, p.vy);
          const max = 6;
          if (sp > max) {
            p.vx = (p.vx / sp) * max;
            p.vy = (p.vy / sp) * max;
          }
        }
      }
    },
  }));

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 1;
      const arr = parts.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        // Drift lembut (gerakan melayang sinusoidal).
        p.vx += Math.sin(t / 90 + p.phase) * 0.008;
        p.vy += Math.cos(t / 110 + p.phase) * 0.008;
        // Friksi.
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        // Bungkus tepi layar.
        if (p.x < -10) p.x = SW + 10;
        if (p.x > SW + 10) p.x = -10;
        if (p.y < -10) p.y = SH + 10;
        if (p.y > SH + 10) p.y = -10;

        const v = views.current[i];
        if (v) {
          v.setNativeProps({
            style: {
              transform: [{ translateX: p.x }, { translateY: p.y }],
            },
          });
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <View style={styles.layer} pointerEvents="none">
      {parts.current.map((p, i) => (
        <View
          key={i}
          ref={(v) => {
            views.current[i] = v;
          }}
          style={[
            styles.dot,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
              transform: [{ translateX: p.x }, { translateY: p.y }],
            },
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    backgroundColor: '#cfe4ff',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
