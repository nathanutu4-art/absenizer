import { useSyncExternalStore } from 'react';

/**
 * Status tombol absensi hari ini (mesin status sesuai prototype):
 * 'in' → biru "Clock In" → 'out' → oranye "Clock Out" → 'done' → redup "Selesai".
 */
export type ClockPhase = 'in' | 'out' | 'done';

interface ClockState {
  phase: ClockPhase;
  inTime: string | null;
  outTime: string | null;
  flags: string[];
}

let state: ClockState = { phase: 'in', inTime: null, outTime: null, flags: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getClockState(): ClockState {
  return state;
}

export function subscribeClock(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Catat clock in (selalu diterima; penanda hanya berupa flag). */
export function recordClockIn(time: string, flags: string[]): void {
  state = { phase: 'out', inTime: time, outTime: null, flags };
  emit();
}

/** Catat clock out. */
export function recordClockOut(time: string): void {
  state = { ...state, phase: 'done', outTime: time };
  emit();
}

/**
 * Isi status clock dari database (dipanggil saat dashboard dimuat).
 * '-' berarti belum ada data.
 */
export function hydrateFromDb(inTime: string, outTime: string): void {
  const hasIn = inTime !== '-';
  const hasOut = outTime !== '-';
  if (hasIn && hasOut) {
    state = { phase: 'done', inTime, outTime, flags: [] };
  } else if (hasIn) {
    state = { phase: 'out', inTime, outTime: null, flags: [] };
  } else {
    state = { phase: 'in', inTime: null, outTime: null, flags: [] };
  }
  emit();
}

/** Reset untuk demo (tidak dipakai di alur normal). */
export function resetClock(): void {
  state = { phase: 'in', inTime: null, outTime: null, flags: [] };
  emit();
}

export function useClockState(): ClockState {
  return useSyncExternalStore(subscribeClock, getClockState);
}
