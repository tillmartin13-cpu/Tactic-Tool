import type { KMResult } from '@sg/gpx';
import { Button } from '@sg/ui';

interface SpotModalProps {
  open: boolean;
  kuerzel: string;
  lat: number;
  lng: number;
  kmResults: KMResult[];
  onKuerzelChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function SpotModal({
  open,
  kuerzel,
  lat,
  lng,
  kmResults,
  onKuerzelChange,
  onClose,
  onSave,
  onDelete,
}: SpotModalProps) {
  if (!open) return null;

  const sv = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}`;
  const mp = `https://www.mapillary.com/app/?lat=${lat}&lng=${lng}&z=17`;

  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/50 sm:items-center">
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <h3 className="text-lg font-semibold text-navy">Spot</h3>
        <input
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold uppercase"
          value={kuerzel}
          onChange={(e) => onKuerzelChange(e.target.value.toUpperCase())}
          placeholder="Kürzel"
        />
        <p className="mt-2 text-xs text-slate-500">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {kmResults.map((r) => (
            <span
              key={r.trackName}
              className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-navy"
            >
              {r.trackName}: {r.km.toFixed(1)} km
            </span>
          ))}
          {!kmResults.length && (
            <span className="text-xs text-amber-700">GPX laden für KM</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={sv}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-streetview px-3 py-1.5 text-xs font-bold text-white"
          >
            Street View
          </a>
          <a
            href={mp}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-mapillary px-3 py-1.5 text-xs font-bold text-white"
          >
            Mapillary
          </a>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={onSave}>
            Speichern
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Schließen
          </Button>
          {onDelete ? (
            <Button variant="danger" onClick={onDelete}>
              Löschen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
