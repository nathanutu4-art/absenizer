import * as SQLite from 'expo-sqlite';

/**
 * Antrean offline (outbox) untuk clock in/out — BR-26 (Q-06).
 *
 * Saat tidak ada koneksi, data absensi (foto selfie, koordinat, timestamp)
 * disimpan di SQLite perangkat dengan status "Menunggu Sinkron", lalu
 * disinkronkan otomatis begitu koneksi kembali — tanpa tindakan manual.
 * Setelah tersinkron, pemeriksaan server (geofence, verifikasi wajah,
 * status terlambat) dijalankan terhadap data tersebut.
 *
 * CATATAN KEJUJURAN (BR-26): detail resolusi konflik (selisih jam perangkat
 * vs jam server) mengikuti praktik wajar — waktu resmi adalah waktu server
 * (BR-03); selisih yang jauh dicatat sebagai informasi, bukan keputusan PRD.
 */

export interface QueuedClockEvent {
  id: number;
  /** 'in' | 'out' */
  kind: 'in' | 'out';
  employeeId: string;
  /** URI lokal file foto selfie. */
  selfieUri: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  /** Waktu di perangkat (ISO string) saat tombol ditekan. */
  deviceTime: string;
  /** Jumlah percobaan sinkron yang sudah dilakukan. */
  attempts: number;
  createdAt: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('absenizer_outbox.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS clock_outbox (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL CHECK (kind IN ('in', 'out')),
          employee_id TEXT NOT NULL,
          selfie_uri TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          accuracy REAL,
          device_time TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_clock_outbox_created
          ON clock_outbox (created_at);
      `);
      return db;
    })();
  }
  return dbPromise;
}

/** Simpan satu event clock in/out ke antrean lokal. Mengembalikan id antrean. */
export async function enqueueClockEvent(event: Omit<QueuedClockEvent, 'id' | 'attempts' | 'createdAt'>): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO clock_outbox
       (kind, employee_id, selfie_uri, latitude, longitude, accuracy, device_time)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.kind,
      event.employeeId,
      event.selfieUri,
      event.latitude,
      event.longitude,
      event.accuracy,
      event.deviceTime,
    ],
  );
  return Number(res.lastInsertRowId);
}

/** Ambil seluruh antrean (urut tertua dulu = FIFO). */
export async function getQueuedEvents(): Promise<QueuedClockEvent[]> {
  const db = await getDb();
  return db.getAllAsync<QueuedClockEvent>(
    `SELECT id, kind, employee_id AS employeeId, selfie_uri AS selfieUri,
            latitude, longitude, accuracy,
            device_time AS deviceTime, attempts,
            created_at AS createdAt
     FROM clock_outbox ORDER BY created_at ASC`,
  );
}

/** Hapus satu item antrean setelah berhasil tersinkron. */
export async function dequeueClockEvent(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM clock_outbox WHERE id = ?`, [id]);
}

/** Tambah hitungan percobaan sinkron (untuk backoff / diagnostik). */
export async function bumpAttempts(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE clock_outbox SET attempts = attempts + 1 WHERE id = ?`, [id]);
}

/**
 * Sinkronkan antrean: untuk tiap item, panggil `uploader`.
 * `uploader` menerima item dan harus melempar bila gagal — item gagal
 * tetap di antrean dan `attempts`-nya bertambah.
 *
 * TODO (Fase 1): panggil fungsi ini saat event koneksi kembali (listener
 * NetInfo — perlu expo-network / @react-native-community/netinfo) dan saat
 * aplikasi dibuka. `uploader` mengunggah foto ke Storage Supabase lalu insert
 * baris attendance via klien Supabase.
 */
export async function syncQueue(
  uploader: (item: QueuedClockEvent) => Promise<void>,
): Promise<{ synced: number; failed: number }> {
  const items = await getQueuedEvents();
  let synced = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await uploader(item);
      await dequeueClockEvent(item.id);
      synced += 1;
    } catch {
      await bumpAttempts(item.id);
      failed += 1;
    }
  }
  return { synced, failed };
}
