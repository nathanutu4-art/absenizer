/**
 * Tema AbsensiKu — token desain dari high-fidelity prototype.
 *
 * Primer indigo: #0057ba (indigo), #00468f (indigo-deep), #00325e (indigo-dark).
 * Teks: #223140 (ink), #5c7287 (ink2), #93a3b1 (ink3).
 * Latar: #f1f3f6 (bg), garis: #dfe2ea (line).
 *
 * Warna status pengajuan: Sakit = merah, Cuti = biru, Ijin = kuning.
 */

export const colors = {
  // --- Primer ---
  indigo: '#0057ba',
  indigoDeep: '#00468f',
  indigoDark: '#00325e',
  /** Ujung terang gradasi tombol primer (#2f7ed0). */
  indigoBright: '#2f7ed0',

  // --- Teks & netral ---
  ink: '#223140',
  ink2: '#5c7287',
  ink3: '#93a3b1',
  line: '#dfe2ea',
  bg: '#f1f3f6',
  surface: '#ffffff',

  // --- Semantik ---
  green: '#16a34a',
  greenBg: '#e8f7ee',
  red: '#dc2626',
  redBg: '#fdeeee',
  blue: '#2563eb',
  blueBg: '#e9f0fe',
  yellowText: '#ca8a04',
  yellowRing: '#eab308',
  yellowBg: '#fdf6e0',
  orange: '#ea580c',
  orangeBg: '#fdeee2',

  // --- Gradasi clock-out ---
  clockOutFrom: '#f59e0b',
  clockOutTo: '#d97706',

  // --- Layar gelap (kamera / liveness) ---
  darkBg: '#0b1220',
  darkSurface: '#151f31',
} as const;

/** Warna status pengajuan: Sakit = merah, Cuti = biru, Ijin = kuning. */
export const leaveStatusColors = {
  sakit: { fg: colors.red, bg: colors.redBg },
  cuti: { fg: colors.blue, bg: colors.blueBg },
  ijin: { fg: colors.yellowText, bg: colors.yellowBg },
} as const;

export type LeaveKind = keyof typeof leaveStatusColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  /** Kartu */
  card: 20,
  /** Tombol */
  button: 14,
  /** Chip */
  chip: 999,
  /** Input */
  input: 13,
} as const;

/**
 * Nama family font Plus Jakarta Sans (dimuat via expo-font di _layout).
 * Gunakan `fontFamily('700')` untuk weight tertentu.
 */
export function fontFamily(weight: '400' | '500' | '600' | '700' | '800'): string {
  switch (weight) {
    case '400':
      return 'PlusJakartaSans_400Regular';
    case '500':
      return 'PlusJakartaSans_500Medium';
    case '600':
      return 'PlusJakartaSans_600SemiBold';
    case '700':
      return 'PlusJakartaSans_700Bold';
    case '800':
      return 'PlusJakartaSans_800ExtraBold';
  }
}

export const typography = {
  heroTitle: {
    fontSize: 26,
    fontFamily: fontFamily('800'),
    color: '#ffffff',
  },
  title: { fontSize: 22, fontFamily: fontFamily('800'), color: colors.ink },
  subtitle: { fontSize: 16, fontFamily: fontFamily('700'), color: colors.ink },
  body: { fontSize: 14, fontFamily: fontFamily('400'), color: colors.ink },
  caption: { fontSize: 12, fontFamily: fontFamily('400'), color: colors.ink2 },
  button: { fontSize: 16, fontFamily: fontFamily('700'), color: '#ffffff' },
} as const;
