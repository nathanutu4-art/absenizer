/** "08.02" -> menit sejak tengah malam; null bila format tak valid. */
function jamToMinutes(jam: string | null | undefined): number | null {
  if (!jam) return null;
  const m = jam.match(/^(\d{1,2})\.(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Hitung durasi kerja dari jam clock in & clock out ("HH.MM").
 * Contoh: "08.02"–"17.05" -> "9j 3m". '--' bila salah satu kosong/tak valid.
 */
export function calcDuration(
  inTime: string | null | undefined,
  outTime: string | null | undefined,
): string {
  const a = jamToMinutes(inTime);
  const b = jamToMinutes(outTime);
  if (a === null || b === null) return '--';
  // M2: Shift lewat tengah malam — clock-out dianggap hari berikutnya.
  const diff = b < a ? b + 1440 - a : b - a;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}j ${m}m`;
}
