/**
 * Penampung sementara URI foto selfie antar layar clock-in.
 * Diunggah (setelah resize) ke Supabase Storage saat konfirmasi.
 */
let uri: string | null = null;

/** Simpan URI foto selfie hasil jepretan kamera untuk dipakai layar berikutnya. */
export function setSelfiePhoto(value: string | null) {
  uri = value;
}

/** Ambil URI foto selfie yang sedang ditampung; null bila belum ada. */
export function getSelfiePhoto(): string | null {
  return uri;
}

/** Hapus foto tersimpan agar tidak dipakai ulang di flow berikutnya. */
export function clearSelfiePhoto(): void {
  uri = null;
}
