import { kmResultsForPoint, snapToTrack } from './nearest';
import type { KMLSpot, Track } from './types';

export function parseKML(kmlString: string, tracks: Track[]): KMLSpot[] {
  const doc = new DOMParser().parseFromString(kmlString, 'application/xml');
  const placemarks = Array.from(doc.querySelectorAll('Placemark'));
  const spots: KMLSpot[] = [];

  for (const pm of placemarks) {
    const coordEl = pm.querySelector('Point coordinates');
    if (!coordEl) continue;
    const parts = coordEl.textContent?.trim().split(',') ?? [];
    if (parts.length < 2) continue;
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    let name = pm.querySelector('name')?.textContent?.trim() ?? 'SPOT';
    name = (name.substring(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'SPOT');

    const snapped = snapToTrack(lat, lng, tracks);
    spots.push({
      name,
      lat: snapped.lat,
      lng: snapped.lng,
      kmResults: tracks.length ? kmResultsForPoint(snapped.lat, snapped.lng, tracks) : undefined,
    });
  }

  return spots;
}
