import type { AmbiguousKmOption } from '@sg/gpx';

interface AmbiguitySelectorProps {
  trackName: string;
  color: string;
  options: AmbiguousKmOption[];
  selectedKms: number[];
  onToggle: (km: number) => void;
}

export function AmbiguitySelector({
  trackName,
  color,
  options,
  selectedKms,
  onToggle,
}: AmbiguitySelectorProps) {
  return (
    <div className="border-b border-slate-100 py-2">
      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className="flex-1 text-xs text-slate-600">{trackName}</span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">
          ⚠ Ambiguous
        </span>
      </div>
      <p className="mb-1 pl-3.5 text-[11px] text-slate-500">
        Route passes here twice — select one or both:
      </p>
      <div className="flex flex-wrap gap-1 pl-3.5">
        {options.map((o) => {
          const on = selectedKms.includes(o.km);
          return (
            <button
              key={o.km}
              type="button"
              onClick={() => onToggle(o.km)}
              className={`rounded-md border-[1.5px] border-navy px-2 py-0.5 text-[11px] font-extrabold ${
                on ? 'bg-navy text-white' : 'bg-white text-navy'
              }`}
            >
              KM {o.km.toFixed(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
