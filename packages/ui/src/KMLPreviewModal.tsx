import { Button } from './Button';

export interface KMLPreviewSpot {
  name: string;
  lat: number;
  lng: number;
}

interface KMLPreviewModalProps {
  open: boolean;
  spots: KMLPreviewSpot[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function KMLPreviewModal({
  open,
  spots,
  selected,
  onToggle,
  onSelectAll,
  onSelectNone,
  onConfirm,
  onClose,
}: KMLPreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/50 sm:items-center">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white p-6 sm:rounded-2xl"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <h3 className="text-lg font-semibold text-navy">KML / KMZ Import</h3>
        <p className="mt-1 text-sm text-slate-600">
          {spots.length} Placemarks — abwählen, was nicht importiert werden soll.
        </p>
        <div className="mt-2 flex gap-2 text-xs">
          <button type="button" className="text-navy underline" onClick={onSelectAll}>
            Alle
          </button>
          <button type="button" className="text-navy underline" onClick={onSelectNone}>
            Keine
          </button>
        </div>
        <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
          {spots.map((s, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => onToggle(i)}
                />
                <span className="font-bold text-brand-red">{s.name}</span>
                <span className="text-xs text-slate-500">
                  {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={onConfirm} disabled={!selected.size}>
            Import ({selected.size})
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}
