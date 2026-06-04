import type { Track } from '@sg/gpx';

export interface ArrowPosition {
  lat: number;
  lng: number;
  rotationDeg: number;
}

/** ~every 3 km along track — port from v1 addDirectionArrows */
export function getDirectionArrowPositions(track: Track): ArrowPosition[] {
  if (track.points.length < 2) return [];
  const count = Math.max(3, Math.min(10, Math.floor(track.totalKm / 3)));
  const intervalKm = track.totalKm / (count + 1);
  const out: ArrowPosition[] = [];
  let nextKm = intervalKm;

  for (let i = 1; i < track.points.length; i++) {
    if (track.cumKm[i] < nextKm) continue;
    const p1 = track.points[i];
    const p2 = track.points[Math.min(i + 10, track.points.length - 1)];
    const deg = (Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180) / Math.PI;
    out.push({ lat: p1.lat, lng: p1.lng, rotationDeg: deg });
    nextKm += intervalKm;
    if (nextKm > track.totalKm) break;
  }
  return out;
}
