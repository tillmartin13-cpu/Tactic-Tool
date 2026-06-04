import { downloadSpotInfoPdf } from '@sg/export';
import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import { listSpotReports, type SpotReportRow } from '../../lib/spotReports';
import type { WorkspaceSpot } from '../../types/event';

interface SpotInfoPanelProps {
  eventUuid: string;
  eventSportografId: string;
  eventName: string | null;
  spots: WorkspaceSpot[];
}

export function SpotInfoPanel({
  eventUuid,
  eventSportografId,
  eventName,
  spots,
}: SpotInfoPanelProps) {
  const [reports, setReports] = useState<SpotReportRow[]>([]);

  useEffect(() => {
    void listSpotReports(eventUuid).then(setReports);
  }, [eventUuid]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">SpotInfo</h3>
      <Button
        className="mt-2 w-full"
        onClick={() =>
          downloadSpotInfoPdf(
            eventSportografId,
            eventName,
            spots.map((s) => ({
              kuerzel: s.kuerzel,
              kmLines: s.kmResults.map((k) => ({ trackName: k.trackName, km: k.km })),
            })),
          )
        }
        disabled={!spots.length}
      >
        PDF exportieren
      </Button>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-xs">
        {reports.map((r) => (
          <li key={r.id}>
            <span className="font-bold">{r.photographer.kuerzel ?? r.photographer.name}</span>
            {' — '}
            {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
          </li>
        ))}
        {!reports.length && <li className="text-slate-500">Noch keine Reports</li>}
      </ul>
    </section>
  );
}
