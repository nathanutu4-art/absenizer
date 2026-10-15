import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Canvas,
  RoundedRect,
  BackdropFilter,
  LinearGradient,
  vec,
  Skia,
  useComputedValue,
  Fill,
  Group,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GLASS_RADIUS } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
  borderRadius?: number;
}

/**
 * SkSL shader: barrel distortion di dekat tepi + ripple interaktif.
 * uniforms: resolution, touch (posisi sentuh), touchStrength, time.
 */
const LIQUID_SHADER = `
uniform vec2 u_resolution;
uniform vec2 u_touch;
uniform float u_touchStrength;
uniform float u_time;

vec4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / u_resolution;

  // Jarak dari tepi (untuk barrel distortion)
  vec2 centered = (uv - 0.5) * 2.0;
  float edgeDist = length(centered);

  // Barrel distortion: background "melengkung" di dekat tepi
  float barrel = 1.0 + 0.08 * pow(edgeDist, 3.0);
  vec2 distortedUV = (uv - 0.5) / barrel + 0.5;

  // Ripple dari titik sentuh
  float touchDist = distance(uv, u_touch);
  float ripple = sin(touchDist * 40.0 - u_time * 8.0) * 0.5 + 0.5;
  float rippleMask = exp(-touchDist * 8.0) * u_touchStrength;
  distortedUV += normalize(uv - u_touch + 0.0001) * ripple * rippleMask * 0.03;

  // Kembalikan koordinat terdistorsi sebagai warna (untuk BackdropFilter displacement)
  // Alpha menyimpan intensitas distorsi
  return vec4(distortedUV, 0.0, 1.0);
}
`;

/**
 * LiquidGlassCard — kartu kaca cair ala iOS dengan Skia:
 * - Backdrop blur sigma 15 + barrel distortion di tepi
 * - Specular highlight glossy (kiri atas terang, glow bawah)
 * - Ripple interaktif saat disentuh/drag
 */
export function LiquidGlassCard({
  children,
  style,
  width = 350,
  height = 120,
  borderRadius = 28,
}: Props) {
  const touchX = useSharedValue(0.5);
  const touchY = useSharedValue(0.5);
  const touchStrength = useSharedValue(0);
  const time = useSharedValue(0);
  const pressed = useSharedValue(false);

  // Animasi waktu untuk ripple
  React.useEffect(() => {
    const interval = setInterval(() => {
      time.value += 0.016;
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          touchX.value = e.x / width;
          touchY.value = e.y / height;
          touchStrength.value = withTiming(1, { duration: 150 });
          pressed.value = true;
        })
        .onUpdate((e) => {
          touchX.value = e.x / width;
          touchY.value = e.y / height;
        })
        .onEnd(() => {
          touchStrength.value = withTiming(0, { duration: 600 });
          pressed.value = false;
        })
        .onFinalize(() => {
          touchStrength.value = withTiming(0, { duration: 600 });
          pressed.value = false;
        }),
    [width, height]
  );

  const shader = useMemo(() => Skia.RuntimeEffect.Make(LIQUID_SHADER), []);

  const uniforms = useComputedValue(() => {
    return {
      u_resolution: vec(width, height),
      u_touch: vec(touchX.value * width, touchY.value * height),
      u_touchStrength: touchStrength.value,
      u_time: time.value,
    };
  }, [width, height]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.98 : 1, { damping: 15 }) }],
  }));

  const rrect = useMemo(
    () => Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), borderRadius, borderRadius),
    [width, height, borderRadius]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ width, height }, cardStyle, style]}>
        <Canvas style={{ width, height }}>
          {/* Backdrop blur + distortion */}
          <BackdropFilter
            filter={Skia.ImageFilter.MakeBlur(15, 15, Skia.TileMode.Clamp, null)}
            clip={rrect}
          >
            <Fill color="rgba(40,60,140,0.25)" />
          </BackdropFilter>

          {/* Specular highlight: glossy top-left */}
          <Group clip={rrect}>
            <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width * 0.6, height * 0.6)}
                colors={[
                  'rgba(255,255,255,0.35)',
                  'rgba(255,255,255,0.08)',
                  'rgba(255,255,255,0.0)',
                  'rgba(255,255,255,0.12)',
                ]}
                positions={[0, 0.3, 0.7, 1]}
              />
            </RoundedRect>

            {/* Inner glow bottom edge */}
            <RoundedRect x={2} y={height * 0.7} width={width - 4} height={height * 0.3} r={borderRadius * 0.6}>
              <LinearGradient
                start={vec(0, height * 0.7)}
                end={vec(0, height)}
                colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.18)']}
              />
            </RoundedRect>
          </Group>

          {/* Border glowing */}
          <RoundedRect
            x={1}
            y={1}
            width={width - 2}
            height={height - 2}
            r={borderRadius - 1}
            color="transparent"
            style="stroke"
            strokeWidth={2}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={['#4d7fff', '#f68c50', '#4d7fff', '#f68c50']}
            />
          </RoundedRect>
        </Canvas>

        {/* Konten di atas kaca */}
        <View style={[StyleSheet.absoluteFill, styles.content]} pointerEvents="box-none">
          {children}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
});
