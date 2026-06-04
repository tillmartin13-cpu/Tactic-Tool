import JSZip from 'jszip';
import { parseKML } from './parseKML';
import type { KMLSpot, Track } from './types';

export async function parseKMZ(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  let kmlFile: JSZip.JSZipObject | null = null;
  zip.forEach((path, file) => {
    if (!kmlFile && path.toLowerCase().endsWith('.kml')) kmlFile = file;
  });
  if (!kmlFile) throw new Error('No KML found inside KMZ');
  return kmlFile.async('string');
}

export async function parseKMZSpots(
  arrayBuffer: ArrayBuffer,
  tracks: Track[],
): Promise<KMLSpot[]> {
  const kml = await parseKMZ(arrayBuffer);
  return parseKML(kml, tracks);
}
