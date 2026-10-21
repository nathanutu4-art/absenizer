import * as SecureStore from 'expo-secure-store';

/** Kunci penyimpanan sesi login di SecureStore. */
export const SESSION_KEY = 'absenizer_session';

export type DemoRole = 'karyawan' | 'pic' | 'hr';

export interface Session {
  demo?: boolean;
  email?: string;
  userId?: string;
  role?: DemoRole;
}

/** Baca sesi tersimpan; peran default 'karyawan' bila belum ada. */
export async function getSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** Peran pengguna aktif untuk tab bar berbasis peran. */
export async function getActiveRole(): Promise<DemoRole> {
  const session = await getSession();
  return session?.role ?? 'karyawan';
}

/** Hapus sesi tersimpan (logout) dari SecureStore. */
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
