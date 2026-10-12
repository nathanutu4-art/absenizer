/**
 * Utilitas geofence: jarak haversine (meter) antara dua koordinat.
 * Dipakai untuk validasi radius GEOFENCE_RADIUS_M terhadap titik kantor (BR-05).
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_M = 6_371_000;

/** Jarak dalam meter antara dua titik koordinat (rumus haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** True bila posisi berada di dalam radius (meter) dari titik acuan. */
export function isInsideGeofence(
  position: LatLng,
  center: LatLng,
  radiusM: number,
): boolean {
  return distanceMeters(position, center) <= radiusM;
}
