import JSZip from 'jszip';
import { parseKML } from './parseKML';
import type { KMLSpot, Track } from './types';

export async function parseKMZ(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  let kmlPath: string | null = null;
  zip.forEach((path) => {
    if (!kmlPath && path.toLowerCase().endsWith('.kml')) kmlPath = path;
  });
  if (!kmlPath) throw new Error('No KML found inside KMZ');
  const file = zip.file(kmlPath);
  if (!file) throw new Error('No KML found inside KMZ');
  return file.async('string');
}

export async function parseKMZSpots(
  arrayBuffer: ArrayBuffer,
  tracks: Track[],
): Promise<KMLSpot[]> {
  const kml = await parseKMZ(arrayBuffer);
  return parseKML(kml, tracks);
}
