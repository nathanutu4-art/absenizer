import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Dimensions, View } from 'react-native';

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
 * Optimasi performa:
 * - 30fps (bukan 60fps) — cukup untuk drift lembut.
 * - Loop tidur saat semua partikel nyaris diam; bangun saat impulse().
 * - Transform GPU via setNativeProps (tanpa layout, tanpa re-render).
 */
export const ParticleBackground = forwardRef<ParticleHandle, Props>(function ParticleBackground(
  { count = 24 },
  ref,
) {
  const views = useRef<Array<View | null>>([]);
  const parts = useRef<Particle[]>([]);
  const running = useRef(false);
  const raf = useRef(0);

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

  const step = () => {
    const arr = parts.current;
    let maxSpeed = 0;
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = SW + 10;
      if (p.x > SW + 10) p.x = -10;
      if (p.y < -10) p.y = SH + 10;
      if (p.y > SH + 10) p.y = -10;

      const sp = Math.abs(p.vx) + Math.abs(p.vy);
      if (sp > maxSpeed) maxSpeed = sp;

      const v = views.current[i];
      if (v) {
        v.setNativeProps({
          transform: [{ translateX: p.x }, { translateY: p.y }],
        });
      }
    }
    // Tidur bila semua partikel nyaris diam (hemat baterai/CPU).
    if (maxSpeed < 0.02) {
      running.current = false;
      return;
    }
    raf.current = setTimeout(() => {
      requestAnimationFrame(step);
    }, 33) as unknown as number; // ~30fps
  };

  const wake = () => {
    if (!running.current) {
      running.current = true;
      requestAnimationFrame(step);
    }
  };

  useImperativeHandle(ref, () => ({
    impulse(x, y, vx, vy, radius = 160) {
      let moved = false;
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
          moved = true;
        }
      }
      if (moved) wake();
    },
  }));

  // Mulai dengan gerakan awal lembut, lalu tidur otomatis.
  useEffect(() => {
    wake();
    return () => {
      running.current = false;
      clearTimeout(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    >
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
