/**
 * Penampung sementara URI foto selfie antar layar clock-in.
 * (Demo — nanti digantikan upload ke backend/CompreFace.)
 */
let uri: string | null = null;

export function setSelfiePhoto(value: string | null) {
  uri = value;
}

export function getSelfiePhoto(): string | null {
  return uri;
}
