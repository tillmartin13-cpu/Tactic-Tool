/** Parsed Sportograf *_infofile.txt (see docs/import-formats/infofile-format.md) */

export interface InfofileHeader {
  eventId: string;
  spotGroupCount?: number;
  totalImages?: number;
  timeRangeRaw?: string;
  durationRaw?: string;
}

export interface InfofileAssignment {
  /** Photographer / line-spot code, e.g. EK2, HV2LS1 */
  kuerzel: string;
  stationIndex: number;
  stationTitle: string;
  photoCount?: number;
  shootStart?: string;
  shootEnd?: string;
  durationRaw?: string;
  lat?: number;
  lng?: number;
  locationInvalid: boolean;
}

export interface ParsedInfofile {
  header: InfofileHeader;
  assignments: InfofileAssignment[];
}

const HEADER_EVENT = /^EventId:\s*(\S+)/i;
const HEADER_SPOTS = /^Spots:\s*(\d+)/i;
const HEADER_IMAGES = /^Total Images:\s*(\d+)/i;
const HEADER_TIME = /^Time:/i;
const HEADER_DURATION = /^Duration:/i;
const SPOT_GROUP = /^\((\d+)\)\s*-\s*(.+)$/;
const KUERZEL = /^[A-Z][A-Z0-9]{1,15}$/;
const FIELD_IMAGES = /^\s*Images:\s*(\d+)/i;
const FIELD_TIME = /^\s*Time:\s*(.+?)\s+until\s+(.+)$/i;
const FIELD_DURATION = /^\s*Duration:\s*(.+)$/i;
const FIELD_LOCATION = /^\s*Location:\s*(.+)$/i;

function parseLocation(raw: string): { lat?: number; lng?: number; invalid: boolean } {
  const t = raw.trim();
  if (!t || /^NULL\s+NULL$/i.test(t)) return { invalid: true };
  const parts = t.split(/\s+/);
  if (parts.length < 2) return { invalid: true };
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { invalid: true };
  return { lat, lng, invalid: false };
}

function parseGermanDateTime(s: string): string | undefined {
  const m = s.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh, mi, ss] = m;
  if (yyyy === '0001') return undefined;
  const iso = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Parse a Sportograf infofile .txt export.
 */
export function parseInfofile(text: string): ParsedInfofile {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const header: InfofileHeader = { eventId: '' };
  const assignments: InfofileAssignment[] = [];

  let stationIndex = 0;
  let stationTitle = '';
  let current: Partial<InfofileAssignment> | null = null;

  const flush = () => {
    if (!current?.kuerzel) return;
    assignments.push({
      kuerzel: current.kuerzel,
      stationIndex,
      stationTitle,
      photoCount: current.photoCount,
      shootStart: current.shootStart,
      shootEnd: current.shootEnd,
      durationRaw: current.durationRaw,
      lat: current.lat,
      lng: current.lng,
      locationInvalid: current.locationInvalid ?? true,
    });
    current = null;
  };

  for (const line of lines) {
    const eventMatch = line.match(HEADER_EVENT);
    if (eventMatch) {
      header.eventId = eventMatch[1];
      continue;
    }
    const spotsMatch = line.match(HEADER_SPOTS);
    if (spotsMatch) {
      header.spotGroupCount = parseInt(spotsMatch[1], 10);
      continue;
    }
    const imagesMatch = line.match(HEADER_IMAGES);
    if (imagesMatch) {
      header.totalImages = parseInt(imagesMatch[1], 10);
      continue;
    }
    if (HEADER_TIME.test(line)) {
      header.timeRangeRaw = line.replace(/^Time:\s*/i, '').trim();
      continue;
    }
    if (HEADER_DURATION.test(line) && !current) {
      header.durationRaw = line.replace(/^Duration:\s*/i, '').trim();
      continue;
    }

    const groupMatch = line.match(SPOT_GROUP);
    if (groupMatch) {
      flush();
      stationIndex = parseInt(groupMatch[1], 10);
      stationTitle = groupMatch[2].trim();
      continue;
    }

    const trimmed = line.trim();
    if (
      trimmed &&
      KUERZEL.test(trimmed) &&
      !trimmed.includes(':') &&
      !SPOT_GROUP.test(line)
    ) {
      flush();
      current = {
        kuerzel: trimmed,
        stationIndex,
        stationTitle,
        locationInvalid: true,
      };
      continue;
    }

    if (!current) continue;

    const img = line.match(FIELD_IMAGES);
    if (img) {
      current.photoCount = parseInt(img[1], 10);
      continue;
    }
    const time = line.match(FIELD_TIME);
    if (time) {
      current.shootStart = parseGermanDateTime(time[1]);
      current.shootEnd = parseGermanDateTime(time[2]);
      continue;
    }
    const dur = line.match(FIELD_DURATION);
    if (dur) {
      current.durationRaw = dur[1].trim();
      continue;
    }
    const loc = line.match(FIELD_LOCATION);
    if (loc) {
      const { lat, lng, invalid } = parseLocation(loc[1]);
      current.lat = lat;
      current.lng = lng;
      current.locationInvalid = invalid;
    }
  }

  flush();

  return { header, assignments };
}
