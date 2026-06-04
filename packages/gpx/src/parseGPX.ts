import { haversine } from './haversine';
import type { Track } from './types';

export function parseGPX(xmlString: string, filename: string): Track {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const pts = Array.from(doc.querySelectorAll('trkpt, rtept'));
  if (!pts.length) throw new Error(`No track points in ${filename}`);

  let hasEle = false;
  const points = pts
    .map((p) => {
      const ele = p.querySelector('ele');
      if (ele) hasEle = true;
      return {
        lat: parseFloat(p.getAttribute('lat') ?? ''),
        lng: parseFloat(p.getAttribute('lon') ?? ''),
        ele: ele ? parseFloat(ele.textContent ?? '') : undefined,
      };
    })
    .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

  let totalKm = 0;
  const cumKm = [0];
  for (let i = 1; i < points.length; i++) {
    totalKm += haversine(points[i - 1], points[i]);
    cumKm.push(totalKm);
  }

  const name = filename.replace(/\.gpx$/i, '');
  return {
    id: crypto.randomUUID(),
    name,
    points,
    cumKm,
    totalKm,
    hasEle,
  };
}

export function trackToGeojson(track: Track) {
  return {
    points: track.points,
    cumKm: track.cumKm,
    totalKm: track.totalKm,
    hasEle: track.hasEle,
  };
}

export function geojsonToTrack(
  id: string,
  name: string,
  color: string,
  geojson: { points: Track['points']; cumKm: number[]; totalKm: number; hasEle: boolean },
): Track {
  return {
    id,
    name,
    color,
    points: geojson.points,
    cumKm: geojson.cumKm,
    totalKm: geojson.totalKm,
    hasEle: geojson.hasEle,
  };
}
