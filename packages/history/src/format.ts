import type { ArchiveSpot } from './types';

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/** One-line hint for map UI, e.g. "2024 · MK · 08:00–11:30 · 1.240 Fotos" */
export function formatArchiveSpotLabel(
  spot: ArchiveSpot,
  seasonYear?: number,
): string {
  const parts: string[] = [];
  if (seasonYear) parts.push(String(seasonYear));
  if (spot.photographerKuerzel) parts.push(spot.photographerKuerzel);
  const start = formatTime(spot.shootStart);
  const end = formatTime(spot.shootEnd);
  if (start && end) parts.push(`${start}–${end}`);
  else if (start) parts.push(`ab ${start}`);
  if (spot.photoCount != null) {
    parts.push(`${spot.photoCount.toLocaleString('de-DE')} Fotos`);
  }
  if (spot.km != null) parts.push(`${spot.km.toFixed(1)} km`);
  return parts.join(' · ') || 'Archiv-Spot';
}
