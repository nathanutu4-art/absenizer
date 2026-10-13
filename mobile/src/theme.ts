/**
 * Tema AbsensiKu — gaya ukiran vintage (etching), mengikuti hi-fi yang dirombak.
 *
 * Kertas: #fffdf4 (paper), #f6efdb (paper2). Tinta: #1c2733 (etch), #223140.
 * Primer indigo dipertahankan: #0057ba, #00468f, #00325e.
 * Warna status pengajuan: Sakit = merah, Cuti = biru, Ijin = kuning.
 *
 * Bahasa visual: kartu plat tinta (border 1.5px, radius 4px, bayangan keras
 * offset), tombol cap stempel (uppercase, radius 3px, bayangan keras),
 * chip stempel miring -0.6°, ikon medali ukiran, headline serif.
 */

export const colors = {
  // --- Primer (dipertahankan) ---
  indigo: '#0057ba',
  indigoDeep: '#00468f',
  indigoDark: '#00325e',
  /** Ujung terang gradasi hero (#2f7ed0). */
  indigoBright: '#2f7ed0',

  // --- Kertas & tinta ukiran ---
  /** Latar utama: kertas krem. */
  bg: '#fffdf4',
  /** Kertas sekunder / plat ilustrasi. */
  paper2: '#f6efdb',
  plate: '#f8f2df',
  /** Tinta utama. */
  ink: '#1c2733',
  ink2: '#4d5a68',
  ink3: '#8a7f63',
  /** Tinta SVG / border kartu. */
  etch: '#223140',
  etchDeep: '#16222e',
  /** Garis kartu. */
  line: '#c9bfa3',
  /** Permukaan kartu: kertas. */
  surface: '#fffdf4',

  // --- Semantik (dipertahankan) ---
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

  // --- Tombol keputusan ---
  approve: '#14532d',
  reject: '#7f1d1d',

  // --- Sanzo Wada Dictionary of Color Combinations No. 211 ---
  /** Deep Indigo */
  wadaIndigo: '#051230',
  /** Apricot Orange */
  wadaApricot: '#f68c50',
  /** Olive Yellow */
  wadaOlive: '#a6a159',

  // --- Gradasi clock-out ---
  clockOutFrom: '#f59e0b',
  clockOutTo: '#d97706',

  // --- Layar gelap (kamera / liveness) ---
  darkBg: '#0b1220',
  darkSurface: '#151f31',
} // (properti string biasa agar palet bisa diganti saat runtime)

export interface ThemePalette {
  name: string;
  indigo: string;
  apricot: string;
  olive: string;
}

export const DEFAULT_PALETTE: ThemePalette = {
  name: 'Wada No. 211 — Indigo',
  indigo: '#051230',
  apricot: '#f68c50',
  olive: '#a6a159',
};

/** Preset palet untuk panel admin (dibangun dari dictionary Sanzo Wada dkk). */
export const PALETTES: ThemePalette[] = [
  { name: 'Wada No. 211 — Indigo', indigo: '#051230', apricot: '#f68c50', olive: '#a6a159' },
  { name: 'Wada No. 144 — Signal', indigo: '#111314', apricot: '#f37420', olive: '#b73f74' },
  { name: 'Terracotta', indigo: '#3d1d0e', apricot: '#c96f4a', olive: '#d9a441' },
  { name: 'Hutan', indigo: '#12261c', apricot: '#6a9f7b', olive: '#c9a227' },
  { name: 'Samudra', indigo: '#0b2545', apricot: '#2ca6a4', olive: '#e9c46a' },
  { name: 'Anggrek', indigo: '#2d1b2e', apricot: '#9b5de5', olive: '#e0a458' },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Terapkan palet ke colors.wadaIndigo/apricot/olive.
 * Entri yang bukan hex valid diganti nilai DEFAULT_PALETTE — tidak pernah
 * melempar error.
 */
export function applyPalette(p: ThemePalette): void {
  colors.wadaIndigo = HEX_RE.test(p.indigo) ? p.indigo : DEFAULT_PALETTE.indigo;
  colors.wadaApricot = HEX_RE.test(p.apricot) ? p.apricot : DEFAULT_PALETTE.apricot;
  colors.wadaOlive = HEX_RE.test(p.olive) ? p.olive : DEFAULT_PALETTE.olive;
}

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
  /** Kartu plat: sudut tegas. */
  card: 4,
  /** Tombol cap: sudut tegas. */
  button: 3,
  /** Chip stempel. */
  chip: 2,
  /** Input. */
  input: 3,
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

/**
 * Serif untuk headline (Playfair Display di hi-fi). Tanpa bundel font biner,
 * pakai serif sistem sebagai pendekatan terdekat.
 */
export function serifFamily(weight: '700' | '800' | '900' = '800'): string {
  // Android: 'serif' -> Noto Serif; iOS: Georgia.
  return weight === '700' ? 'serif' : 'serif';
}

/** Offset bayangan keras plat cetak (tanpa blur). */
export const plateShadow = 3;

export const typography = {
  heroTitle: {
    fontSize: 26,
    fontFamily: serifFamily('800'),
    color: '#ffffff',
  },
  title: { fontSize: 22, fontFamily: serifFamily('800'), color: colors.ink },
  subtitle: { fontSize: 16, fontFamily: fontFamily('700'), color: colors.ink },
  body: { fontSize: 14, fontFamily: fontFamily('400'), color: colors.ink },
  caption: { fontSize: 12, fontFamily: fontFamily('400'), color: colors.ink2 },
  button: { fontSize: 16, fontFamily: fontFamily('700'), color: '#ffffff' },
} as const;
