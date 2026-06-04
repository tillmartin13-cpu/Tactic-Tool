import { haversine } from './haversine';
import type { KMResult, Track, TrackPoint } from './types';

export function nearestKm(lat: number, lng: number, track: Track): KMResult {
  let best = Infinity;
  let idx = 0;
  for (let i = 0; i < track.points.length; i++) {
    const d = haversine({ lat, lng }, track.points[i]);
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return {
    trackId: track.id,
    trackName: track.name,
    km: track.cumKm[idx],
    dist: best,
  };
}

export function snapToTrack(
  lat: number,
  lng: number,
  tracks: Track[],
): TrackPoint {
  if (!tracks.length) return { lat, lng };
  let best = Infinity;
  let bestPt: TrackPoint = { lat, lng };
  for (const t of tracks) {
    for (const p of t.points) {
      const d = haversine({ lat, lng }, p);
      if (d < best) {
        best = d;
        bestPt = p;
      }
    }
  }
  return bestPt;
}

export function kmResultsForPoint(
  lat: number,
  lng: number,
  tracks: Track[],
): KMResult[] {
  return tracks.map((t) => nearestKm(lat, lng, t));
}
