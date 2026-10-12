/**
 * Tema Absenizer — palet dari buku Sanzo Wada "A Dictionary of Color Combinations",
 * Combination No. 218 (terverifikasi dari arsip digital sanzo-wada.dmbk.io):
 *   Helvetia Blue #0057ba, Grayish Lavender #b8b8ff, Deep Violet/Plumbeous #5c7287.
 *
 * Warna status cuti/ijin/sakit adalah warna SEMANTIK yang ditetapkan PRD dan
 * tidak berasal dari palet Wada: merah = sakit, biru = cuti, kuning = ijin.
 */

export const colors = {
  // --- Palet Wada No. 218 ---
  /** Helvetia Blue — warna primer: tombol utama, hero, tab aktif, aksen panel. */
  primary: '#0057ba',
  primaryDark: '#004a9e',
  /** Grayish Lavender — aksen: latar ilustrasi, gradasi avatar, highlight lembut. */
  accent: '#b8b8ff',
  accentSoft: '#e4e4ff',
  /** Deep Violet / Plumbeous — teks pendukung / sekunder. */
  secondary: '#5c7287',

  // --- Netral ---
  ink: '#101828',
  inkSoft: '#5c7287',
  muted: '#98a2b3',
  line: '#e4e7ec',
  background: '#f8fafc',
  surface: '#ffffff',

  // --- Status kehadiran / pengajuan (semantik PRD, bukan palet Wada) ---
  /** Merah — status SAKIT. */
  danger: '#e5484d',
  dangerSoft: '#fdecec',
  /** Biru — status CUTI. */
  info: '#0d75ff',
  infoSoft: '#e8f1ff',
  /** Kuning — status IJIN. */
  warning: '#f5b800',
  warningSoft: '#fff7e0',
  success: '#12a150',
  successSoft: '#e7f6ec',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  /** Judul layar */
  title: { fontSize: 22, fontWeight: '800' as const, color: colors.ink },
  /** Sub-judul / nama seksi */
  subtitle: { fontSize: 16, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.ink },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.inkSoft },
  button: { fontSize: 16, fontWeight: '700' as const, color: '#ffffff' },
} as const;
