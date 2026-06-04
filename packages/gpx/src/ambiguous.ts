import { haversine } from './haversine';
import type { AmbiguousKmOption, Track } from './types';

/** 30 m threshold, 0.5 km clustering — port from v1 */
export function findAmbiguous(
  lat: number,
  lng: number,
  track: Track,
): AmbiguousKmOption[] | null {
  const close: { i: number; km: number; dist: number }[] = [];
  for (let i = 0; i < track.points.length; i++) {
    const d = haversine({ lat, lng }, track.points[i]);
    if (d <= 0.03) close.push({ i, km: track.cumKm[i], dist: d });
  }
  if (!close.length) return null;
  close.sort((a, b) => a.km - b.km);

  const clusters: typeof close[] = [];
  for (const pt of close) {
    const last = clusters[clusters.length - 1];
    if (last && pt.km - last[last.length - 1].km <= 0.5) last.push(pt);
    else clusters.push([pt]);
  }
  if (clusters.length < 2) return null;

  const best = clusters.map((cl) =>
    cl.reduce((a, b) => (a.dist < b.dist ? a : b)),
  );
  if (Math.abs(best[0].km - best[best.length - 1].km) < 0.5) return null;

  const deduped: typeof best = [];
  for (const b of best) {
    if (!deduped.length || Math.abs(b.km - deduped[deduped.length - 1].km) > 0.5) {
      deduped.push(b);
    }
  }
  if (deduped.length < 2) return null;

  return deduped.map((b) => ({
    trackId: track.id,
    trackName: track.name,
    km: b.km,
    dist: b.dist,
  }));
}
