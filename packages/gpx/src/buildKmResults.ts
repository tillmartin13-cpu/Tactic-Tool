import { nearestKm } from './nearest';
import type { KMResult, Track } from './types';

/** Port from v1 saveSpot — optional per-track KM overrides when ambiguous */
export function buildKmResults(
  lat: number,
  lng: number,
  tracks: Track[],
  overrides: Record<number, number[]> = {},
): KMResult[] {
  const results: KMResult[] = [];
  tracks.forEach((t, ti) => {
    const override = overrides[ti];
    if (override?.length) {
      [...override].sort((a, b) => a - b).forEach((km) => {
        results.push({
          trackId: t.id,
          trackName: t.name,
          km,
          dist: 0,
        });
      });
    } else {
      results.push(nearestKm(lat, lng, t));
    }
  });
  return results;
}
