import { createClient } from '@supabase/supabase-js';

/**
 * Klien Supabase tunggal untuk aplikasi.
 * Kredensial dibaca dari env (lihat mobile/.env.example).
 * Hanya anon key yang dipakai di aplikasi — JANGAN pernah menaruh service_role di sini.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Dilempar saat runtime bila .env belum diisi; layar akan menampilkan pesan galat.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY belum diisi. ' +
      'Salin mobile/.env.example menjadi mobile/.env lalu isi nilainya.',
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
);
