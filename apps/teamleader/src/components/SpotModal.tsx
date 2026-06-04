import {
  buildKmResults,
  extractCoords,
  findAmbiguous,
  isShortUrl,
  snapToTrack,
  trackColor,
  type KMResult,
  type Track,
} from '@sg/gpx';
import { AmbiguitySelector, Button } from '@sg/ui';
import { useEffect, useMemo, useState } from 'react';

interface SpotModalProps {
  open: boolean;
  kuerzel: string;
  lat: number;
  lng: number;
  tracks: Track[];
  onKuerzelChange: (v: string) => void;
  onClose: () => void;
  onSave: (payload: {
    kuerzel: string;
    lat: number;
    lng: number;
    kmResults: KMResult[];
  }) => void;
  onDelete?: () => void;
}

export function SpotModal({
  open,
  kuerzel,
  lat: propLat,
  lng: propLng,
  tracks,
  onKuerzelChange,
  onClose,
  onSave,
  onDelete,
}: SpotModalProps) {
  const [tab, setTab] = useState<'map' | 'paste'>('map');
  const [pasteRaw, setPasteRaw] = useState('');
  const [pasteBusy, setPasteBusy] = useState('');
  const [kmOverrides, setKmOverrides] = useState<Record<number, number[]>>({});
  const [pos, setPos] = useState({ lat: propLat, lng: propLng });

  useEffect(() => {
    if (open) {
      setTab('map');
      setPasteRaw('');
      setPasteBusy('');
      setKmOverrides({});
      setPos({ lat: propLat, lng: propLng });
    }
  }, [open, propLat, propLng]);

  const snapped = useMemo(() => {
    if (!tracks.length) return pos;
    const p = snapToTrack(pos.lat, pos.lng, tracks);
    return { lat: p.lat, lng: p.lng };
  }, [pos, tracks]);

  const kmResults = useMemo(
    () =>
      tracks.length
        ? buildKmResults(snapped.lat, snapped.lng, tracks, kmOverrides)
        : [],
    [snapped.lat, snapped.lng, tracks, kmOverrides],
  );

  function toggleOverride(trackIdx: number, km: number) {
    setKmOverrides((prev) => {
      const arr = [...(prev[trackIdx] ?? [])];
      const i = arr.indexOf(km);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(km);
      const next = { ...prev };
      if (arr.length) next[trackIdx] = arr;
      else delete next[trackIdx];
      return next;
    });
  }

  async function resolvePaste() {
    const raw = pasteRaw.trim();
    if (!raw) return;
    setPasteBusy('…');
    try {
      if (isShortUrl(raw)) {
        const res = await fetch(`/api/resolve-location?url=${encodeURIComponent(raw)}`);
        const data = (await res.json()) as { lat?: number; lng?: number; error?: string };
        if (data.error || data.lat == null) {
          setPasteBusy(data.error ?? 'URL konnte nicht aufgelöst werden');
          return;
        }
        applyCoords(data.lat, data.lng);
        return;
      }
      const c = extractCoords(raw);
      if (!c) {
        setPasteBusy('Keine Koordinaten erkannt');
        return;
      }
      applyCoords(c.lat, c.lng);
    } finally {
      if (pasteBusy === '…') setPasteBusy('');
    }
  }

  function applyCoords(nlat: number, nlng: number) {
    const s = tracks.length ? snapToTrack(nlat, nlng, tracks) : { lat: nlat, lng: nlng };
    setPos({ lat: s.lat, lng: s.lng });
    setKmOverrides({});
    setPasteBusy('');
  }

  if (!open) return null;

  const sv = `https://www.google.com/maps?layer=c&cbll=${snapped.lat},${snapped.lng}`;
  const mp = `https://www.mapillary.com/app/?lat=${snapped.lat}&lng=${snapped.lng}&z=17`;

  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/50 sm:items-center">
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <h3 className="text-lg font-semibold text-navy">Spot</h3>

        <div className="mt-3 flex rounded-lg border border-slate-200 p-0.5">
          {(['map', 'paste'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
                tab === t ? 'bg-navy text-white' : 'text-slate-600'
              }`}
            >
              {t === 'map' ? 'Karte' : 'Link / Koordinaten'}
            </button>
          ))}
        </div>

        {tab === 'map' ? (
          <p className="mt-2 text-xs text-slate-500">
            📍 {snapped.lat.toFixed(5)}, {snapped.lng.toFixed(5)}
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Google Maps, WhatsApp, Koordinaten…"
              value={pasteRaw}
              onChange={(e) => setPasteRaw(e.target.value)}
            />
            <Button variant="secondary" className="w-full" onClick={() => void resolvePaste()}>
              Auflösen
            </Button>
            {pasteBusy && <p className="text-xs text-amber-800">{pasteBusy}</p>}
            <p className="text-xs text-slate-500">
              📍 {snapped.lat.toFixed(5)}, {snapped.lng.toFixed(5)}
            </p>
          </div>
        )}

        <input
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold uppercase"
          value={kuerzel}
          onChange={(e) => onKuerzelChange(e.target.value.toUpperCase())}
          placeholder="Kürzel"
        />

        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
          {!tracks.length ? (
            <p className="text-xs text-amber-700">GPX laden für KM-Positionen</p>
          ) : (
            tracks.map((t, ti) => {
              const col = t.color ?? trackColor(ti);
              const ambig = findAmbiguous(snapped.lat, snapped.lng, t);
              if (ambig) {
                return (
                  <AmbiguitySelector
                    key={t.id}
                    trackName={t.name}
                    color={col}
                    options={ambig}
                    selectedKms={kmOverrides[ti] ?? []}
                    onToggle={(km) => toggleOverride(ti, km)}
                  />
                );
              }
              const r = kmResults.find((k) => k.trackName === t.name);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-2 border-b border-slate-100 py-1.5 last:border-0"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: col }} />
                  <span className="flex-1 text-xs text-slate-600">{t.name}</span>
                  <span className="text-sm font-extrabold text-navy">
                    KM {(r?.km ?? 0).toFixed(1)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <a
            href={sv}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-md bg-streetview py-2 text-center text-xs font-bold text-white"
          >
            Street View
          </a>
          <a
            href={mp}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-md bg-mapillary py-2 text-center text-xs font-bold text-white"
          >
            Mapillary
          </a>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            onClick={() =>
              onSave({
                kuerzel: kuerzel.trim(),
                lat: snapped.lat,
                lng: snapped.lng,
                kmResults,
              })
            }
          >
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
