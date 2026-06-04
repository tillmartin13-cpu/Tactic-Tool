export function MapPlaceholder({ label = 'Map' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
      {label} — Leaflet components coming soon
    </div>
  );
}
