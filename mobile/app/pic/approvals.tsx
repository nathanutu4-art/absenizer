import { Redirect } from 'expo-router';

/**
 * Rute lama (pra-rebuild). Dialihkan ke layar Persetujuan yang baru.
 * Dipertahankan sebagai stub agar tidak ada deep link yang mati.
 */
export default function LegacyRoute() {
  return <Redirect href="/approvals" />;
}
