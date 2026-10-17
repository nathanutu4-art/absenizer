/**
 * Penampung sementara URI foto selfie antar layar clock-in.
 * Diunggah (setelah resize) ke Supabase Storage saat konfirmasi.
 */
let uri: string | null = null;

export function setSelfiePhoto(value: string | null) {
  uri = value;
}

export function getSelfiePhoto(): string | null {
  return uri;
}

/** Hapus foto tersimpan agar tidak dipakai ulang di flow berikutnya. */
export function clearSelfiePhoto(): void {
  uri = null;
}
