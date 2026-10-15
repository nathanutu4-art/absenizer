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
 * Posisi di-set via left/top (bukan transform) agar pasti ter-render.
 * Animasi 60fps via requestAnimationFrame + setNativeProps (tanpa re-render).
 */
export const ParticleBackground = forwardRef<ParticleHandle, Props>(function ParticleBackground(
  { count = 40 },
  ref,
) {
  const views = useRef<Array<View | null>>([]);
  const parts = useRef<Particle[]>([]);

  // Inisialisasi partikel sekali.
  if (parts.current.length === 0) {
    for (let i = 0; i < count; i++) {
      parts.current.push({
        x: Math.random() * SW,
        y: Math.random() * SH,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 3 + Math.random() * 4,
        opacity: 0.35 + Math.random() * 0.4,
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
          const f = (1 - dist / radius) * 0.35;
          p.vx += vx * f;
          p.vy += vy * f;
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
    let raf = 0;
    const tick = () => {
      t += 1;
      const arr = parts.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.vx += Math.sin(t / 90 + p.phase) * 0.008;
        p.vy += Math.cos(t / 110 + p.phase) * 0.008;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = SW + 10;
        if (p.x > SW + 10) p.x = -10;
        if (p.y < -10) p.y = SH + 10;
        if (p.y > SH + 10) p.y = -10;

        const v = views.current[i];
        if (v) {
          v.setNativeProps({
            transform: [{ translateX: p.x }, { translateY: p.y }],
          });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <View style={styles.layer} pointerEvents="none">
      {parts.current.map((p, i) => (
        <View
          key={`p-${i}`}
          ref={(v) => {
            views.current[i] = v;
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#051230',
            opacity: p.opacity,
            transform: [{ translateX: p.x }, { translateY: p.y }],
          }}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
