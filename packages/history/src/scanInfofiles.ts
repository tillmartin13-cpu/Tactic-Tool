import { parseInfofile } from './parseInfofile';

const INFOFILE_RE = /^(\d+)_infofile\.txt$/i;
const GPX_RE = /^(\d+)_gpxTrack\.gpx$/i;

export interface InfofileCatalogEntry {
  sourceEventId: string;
  /** Folder name, e.g. 2025 — label for TL („Archiv 2025“) */
  archiveYear: number;
  hasInfofile: boolean;
  hasGpx: boolean;
  spotGroupCount?: number;
  totalImages?: number;
  /** First valid date from infofile header (ISO) */
  eventDateEnd?: string;
}

export interface InfofileCatalog {
  scannedAt: string;
  years: number[];
  entries: InfofileCatalogEntry[];
}

function inferYearFromDirName(name: string): number | null {
  const y = parseInt(name, 10);
  if (y >= 2000 && y <= 2100) return y;
  return null;
}

function firstEventDateFromHeader(timeRangeRaw?: string): string | undefined {
  if (!timeRangeRaw) return undefined;
  const m = timeRangeRaw.match(/(\d{2})\.(\d{2})\.(\d{4})/g);
  if (!m?.length) return undefined;
  for (const part of m) {
    const p = part.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!p) continue;
    const [, dd, mm, yyyy] = p;
    if (yyyy === '0001') continue;
    const iso = `${yyyy}-${mm}-${dd}`;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return undefined;
}

/**
 * Scan infofiles root (subfolders 2024/, 2025/, … or flat).
 * Pair: {id}_infofile.txt + {id}_gpxTrack.gpx — same Sportograf event ID in filename.
 */
export async function scanInfofilesRoot(
  rootDir: string,
  readText: (path: string) => Promise<string>,
  listDir: (path: string) => Promise<string[]>,
  isDirectory: (path: string) => Promise<boolean>,
): Promise<InfofileCatalog> {
  const entries: InfofileCatalogEntry[] = [];
  const yearsSet = new Set<number>();

  async function scanFolder(dir: string, archiveYear: number) {
    const names = await listDir(dir);
    const gpxIds = new Set<string>();
    for (const name of names) {
      const gm = name.match(GPX_RE);
      if (gm) gpxIds.add(gm[1]);
    }

    for (const name of names) {
      const im = name.match(INFOFILE_RE);
      if (!im) continue;
      const sourceEventId = im[1];
      const txtPath = `${dir}/${name}`;
      let header: ReturnType<typeof parseInfofile>['header'] = { eventId: sourceEventId };
      try {
        const text = await readText(txtPath);
        header = parseInfofile(text).header;
      } catch {
        /* keep filename id */
      }

      entries.push({
        sourceEventId,
        archiveYear,
        hasInfofile: true,
        hasGpx: gpxIds.has(sourceEventId),
        spotGroupCount: header.spotGroupCount,
        totalImages: header.totalImages,
        eventDateEnd: firstEventDateFromHeader(header.timeRangeRaw),
      });
      yearsSet.add(archiveYear);
    }
  }

  const rootNames = await listDir(rootDir);
  let scannedSubfolders = false;

  for (const name of rootNames) {
    const sub = `${rootDir}/${name}`;
    if (!(await isDirectory(sub))) continue;
    const year = inferYearFromDirName(name);
    if (year != null) {
      scannedSubfolders = true;
      await scanFolder(sub, year);
    }
  }

  if (!scannedSubfolders) {
    await scanFolder(rootDir, new Date().getFullYear());
  }

  entries.sort((a, b) => b.archiveYear - a.archiveYear || a.sourceEventId.localeCompare(b.sourceEventId));

  return {
    scannedAt: new Date().toISOString(),
    years: [...yearsSet].sort((a, b) => b - a),
    entries,
  };
}

/** Years that have at least one complete pair (txt + gpx) */
export function yearsWithCompletePairs(catalog: InfofileCatalog): number[] {
  const years = new Set<number>();
  for (const e of catalog.entries) {
    if (e.hasInfofile && e.hasGpx) years.add(e.archiveYear);
  }
  return [...years].sort((a, b) => b - a);
}

/** Entries for one planning event linked to multiple archive years */
export function catalogEntriesForEvent(
  catalog: InfofileCatalog,
  linkedSourceIds: { sourceEventId: string; archiveYear: number }[],
): InfofileCatalogEntry[] {
  return linkedSourceIds
    .map(({ sourceEventId, archiveYear }) =>
      catalog.entries.find(
        (e) => e.sourceEventId === sourceEventId && e.archiveYear === archiveYear,
      ),
    )
    .filter((e): e is InfofileCatalogEntry => e != null);
}
