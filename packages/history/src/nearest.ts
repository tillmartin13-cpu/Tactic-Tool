import type { ArchiveSpot, ArchiveSpotHint } from './types';

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Find closest archive spot within maxDistanceM (for "last year at this location" hints). */
export function findNearestArchiveSpot(
  lat: number,
  lng: number,
  spots: ArchiveSpot[],
  maxDistanceM = 80,
  seasonYear?: number,
): ArchiveSpotHint | null {
  let best: ArchiveSpotHint | null = null;
  for (const spot of spots) {
    const distanceM = haversineM({ lat, lng }, spot);
    if (distanceM <= maxDistanceM && (!best || distanceM < best.distanceM)) {
      best = { spot, distanceM, seasonYear };
    }
  }
  return best;
}
