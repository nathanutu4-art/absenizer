import * as Location from 'expo-location';

/**
 * Deteksi fake GPS / mock location (BR-09).
 *
 * expo-location menandai lokasi palsu lewat properti `mocked` pada objek
 * lokasi (Android: isFromMockProvider). iOS tidak punya konsep mock location
 * sistem — di iOS, lokasi yang dimanipulasi umumnya hanya mungkin pada
 * perangkat jailbreak; pemeriksaan tambahan (mis. deteksi jailbreak) di luar
 * scope MVP.
 *
 * KEPUTUSAN PRD (BR-09): lokasi palsu SELALU diberi penanda "Fake GPS", tetapi
 * pada MVP TIDAK otomatis membatalkan/memblokir kehadiran — tindak lanjut
 * adalah wewenang HR. Fungsi ini mengembalikan hasil pemeriksaan; pemanggil
 * (layar konfirmasi clock-in) wajib mencatat flag bila terdeteksi.
 *
 * TODO (dev build): properti `mocked` hanya andal pada dev build / build
 * produksi — di Expo Go hasilnya bisa tidak akurat. Uji di perangkat fisik.
 */

export interface MockCheckResult {
  /** True bila lokasi terindikasi palsu. */
  isMocked: boolean;
  /** Alasan temuan, untuk kolom alasan pada AttendanceFlag. */
  reason: string | null;
}

/** Minta izin lalu ambil posisi terkini sekaligus hasil pemeriksaan mock. */
export async function getPositionWithMockCheck(): Promise<{
  position: { latitude: number; longitude: number; accuracy: number | null };
  mock: MockCheckResult;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Izin lokasi ditolak. Aktifkan izin lokasi untuk melakukan absensi.');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  // `mocked` tersedia di tipe expo-location (boolean | undefined).
  const mocked = (loc as unknown as { mocked?: boolean }).mocked ?? false;

  return {
    position: {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? null,
    },
    mock: mocked
      ? {
          isMocked: true,
          reason: 'Lokasi terindikasi mock/fake GPS (expo-location mocked=true).',
        }
      : { isMocked: false, reason: null },
  };
}
