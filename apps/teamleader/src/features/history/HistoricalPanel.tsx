import { galleryUrlForEventId } from '@sg/history';
import type { InfofileCatalogEntry } from '@sg/history';
import { Button } from '@sg/ui';

export interface ArchiveYearLink {
  archiveYear: number;
  sourceEventId: string;
}

interface HistoricalPanelProps {
  prevEventId?: string | null;
  linkedArchives?: ArchiveYearLink[];
  catalogYears?: number[];
  catalogEntries?: InfofileCatalogEntry[];
}

function YearBadge({
  year,
  active,
  complete,
}: {
  year: number;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? 'bg-navy text-white'
          : 'border border-slate-300 bg-slate-50 text-slate-700'
      }`}
      title={complete ? 'Infofile + GPX vorhanden' : 'Nur Infofile'}
    >
      {year}
      {complete ? '' : ' · teil'}
    </span>
  );
}

/**
 * Multi-year archive UI — see docs/features/historical-data.md
 */
export function HistoricalPanel({
  prevEventId,
  linkedArchives = [],
  catalogYears = [],
  catalogEntries = [],
}: HistoricalPanelProps) {
  const hasPrev = Boolean(prevEventId?.trim());
  const linkedYears = [...new Set(linkedArchives.map((a) => a.archiveYear))].sort(
    (a, b) => b - a,
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Archiv (Vorjahre)</h2>
      <p className="mt-2 text-sm text-slate-600">
        Mehrere Jahre möglich (z. B. 2024 + 2025): Infofiles nach Ordner hochladen, dann
        mit dem aktuellen Event verknüpfen. Auf der Karte ein Jahr wählen — read-only.
      </p>

      {catalogYears.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Im System verfügbar (Upload)
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {catalogYears.map((year) => {
              const complete = catalogEntries.some(
                (e) =>
                  e.archiveYear === year && e.hasInfofile && e.hasGpx,
              );
              return (
                <YearBadge key={year} year={year} complete={complete} />
              );
            })}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {catalogEntries.length} Event-Archive im Katalog
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Noch kein Katalog — Dateien nach <code className="text-navy">infofiles/2025/</code>{' '}
          legen und <code className="text-navy">npm run scan:infofiles</code> ausführen.
        </p>
      )}

      {linkedYears.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Mit diesem Event verknüpft
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {linkedArchives.map((a) => (
              <YearBadge
                key={`${a.archiveYear}-${a.sourceEventId}`}
                year={a.archiveYear}
                active
                complete
              />
            ))}
          </div>
        </div>
      ) : null}

      {hasPrev ? (
        <p className="mt-3 text-sm text-navy">
          Haupt-Vorjahr (Galerie):{' '}
          <span className="font-mono font-semibold">{prevEventId}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled>Archiv auf Karte (bald)</Button>
        <Button variant="secondary" disabled>
          Jahr verknüpfen (bald)
        </Button>
        {hasPrev ? (
          <a
            href={galleryUrlForEventId(prevEventId!.trim())}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-slate-50"
          >
            Galerie Vorjahr
          </a>
        ) : null}
      </div>
    </section>
  );
}
