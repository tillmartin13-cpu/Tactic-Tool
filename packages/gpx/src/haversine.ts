import type { TrackPoint } from './types';

/** Distance in km between two points */
export function haversine(a: TrackPoint, b: TrackPoint): number {
  const R = 6371;
  const dLa = ((b.lat - a.lat) * Math.PI) / 180;
  const dLo = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLa / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
