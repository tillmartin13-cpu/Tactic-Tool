import { rematchSpot, type TileLayerId } from '@sg/map';
import { parseKML, parseKMZSpots } from '@sg/gpx';
import { Button } from '@sg/ui';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SpotModal } from '../components/SpotModal';
import { HistoricalPanel } from '../features/history/HistoricalPanel';
import {
  deleteSpotDb,
  deleteTrackDb,
  loadEventWorkspace,
  saveSpot,
  uploadTrack,
} from '../lib/events';
import type { EventPhase, EventIntent, WorkspaceSpot } from '../types/event';
import type { Track } from '@sg/gpx';

const EventMap = lazy(() =>
  import('@sg/map').then((m) => ({ default: m.EventMap })),
);

export function EventWorkspacePage() {
  const { eventUuid } = useParams<{ eventUuid: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sportografId, setSportografId] = useState('');
  const [prevEventId, setPrevEventId] = useState<string | null>(null);
  const [intent, setIntent] = useState<EventIntent>('full');
  const [phase, setPhase] = useState<EventPhase>('planning');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [spots, setSpots] = useState<WorkspaceSpot[]>([]);
  const [tile, setTile] = useState<TileLayerId>('osm');
  const [catalogYears, setCatalogYears] = useState<number[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draftKuerzel, setDraftKuerzel] = useState('');
  const [draftLat, setDraftLat] = useState(0);
  const [draftLng, setDraftLng] = useState(0);
  const [draftKm, setDraftKm] = useState<WorkspaceSpot['kmResults']>([]);

  const load = useCallback(async () => {
    if (!eventUuid) return;
    setLoading(true);
    try {
      const { event, tracks: t, spots: s } = await loadEventWorkspace(eventUuid);
      setSportografId(event.event_id);
      setPrevEventId(event.prev_event_id);
      setTracks(t);
      setSpots(s);
      const stored = sessionStorage.getItem(`tactic_intent_${eventUuid}`) as EventIntent | null;
      const i = stored === 'spotinfo_focus' ? 'spotinfo_focus' : 'full';
      setIntent(i);
      setPhase(i === 'spotinfo_focus' && !t.length && !s.length ? 'spotinfo' : 'planning');
      const { listCatalogYears: loadYears } = await import('../lib/events');
      setCatalogYears(await loadYears());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [eventUuid]);

  useEffect(() => {
    load();
  }, [load]);

  function openNewSpot(lat: number, lng: number) {
    const m = rematchSpot(lat, lng, tracks);
    setEditId(null);
    setDraftKuerzel('');
    setDraftLat(m.lat);
    setDraftLng(m.lng);
    setDraftKm(m.kmResults);
    setModalOpen(true);
  }

  function openEditSpot(spot: WorkspaceSpot) {
    setEditId(spot.id);
    setDraftKuerzel(spot.kuerzel);
    setDraftLat(spot.lat);
    setDraftLng(spot.lng);
    setDraftKm(spot.kmResults);
    setModalOpen(true);
  }

  async function handleGpx(files: FileList | null) {
    if (!files?.length || !eventUuid) return;
    for (let i = 0; i < files.length; i++) {
      const t = await uploadTrack(eventUuid, files[i], tracks.length + i);
      setTracks((prev) => [...prev, t]);
    }
    await load();
  }

  async function handleKml(file: File) {
    if (!eventUuid) return;
    const spotsFromKml =
      file.name.toLowerCase().endsWith('.kmz')
        ? await parseKMZSpots(await file.arrayBuffer(), tracks)
        : parseKML(await file.text(), tracks);
    for (const k of spotsFromKml) {
      const saved = await saveSpot(eventUuid, {
        kuerzel: k.name,
        lat: k.lat,
        lng: k.lng,
        kmResults: k.kmResults ?? [],
      });
      setSpots((prev) => [...prev, saved]);
    }
  }

  async function persistSpot() {
    if (!eventUuid || !draftKuerzel.trim()) return;
    const saved = await saveSpot(
      eventUuid,
      { kuerzel: draftKuerzel.trim(), lat: draftLat, lng: draftLng, kmResults: draftKm },
      editId ?? undefined,
    );
    if (editId) {
      setSpots((prev) => prev.map((s) => (s.id === editId ? saved : s)));
    } else {
      setSpots((prev) => [...prev, saved]);
    }
    setModalOpen(false);
  }

  async function removeSpot() {
    if (!editId) return;
    await deleteSpotDb(editId);
    setSpots((prev) => prev.filter((s) => s.id !== editId));
    setModalOpen(false);
  }

  async function onSpotDrag(id: string, lat: number, lng: number) {
    const m = rematchSpot(lat, lng, tracks);
    const spot = spots.find((s) => s.id === id);
    if (!spot || !eventUuid) return;
    const saved = await saveSpot(eventUuid, {
      kuerzel: spot.kuerzel,
      lat: m.lat,
      lng: m.lng,
      kmResults: m.kmResults,
    }, id);
    setSpots((prev) => prev.map((s) => (s.id === id ? saved : s)));
  }

  if (loading) {
    return <p className="text-slate-500">Event laden…</p>;
  }

  if (error) {
    return (
      <p className="text-brand-red">
        {error}{' '}
        <Link to="/" className="underline">
          Start
        </Link>
      </p>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/" className="text-sm text-navy underline">
          ← Events
        </Link>
        <span className="font-semibold text-navy">
          {sportografId}
          {prevEventId ? ` · Vorjahr ${prevEventId}` : ''}
        </span>
        <div className="ml-auto flex rounded-lg border border-slate-200 p-0.5">
          {(['planning', 'spotinfo'] as EventPhase[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                phase === p ? 'bg-navy text-white' : 'text-slate-600'
              }`}
            >
              {p === 'planning' ? 'Planung' : 'SpotInfo'}
            </button>
          ))}
        </div>
      </div>

      {phase === 'planning' && (
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white">
              GPX laden
            </span>
            <input
              type="file"
              accept=".gpx"
              multiple
              className="hidden"
              onChange={(e) => handleGpx(e.target.files)}
            />
          </label>
          <label className="cursor-pointer">
            <span className="inline-flex rounded-md border border-navy/30 px-3 py-1.5 text-sm font-medium text-navy">
              KML / KMZ
            </span>
            <input
              type="file"
              accept=".kml,.kmz"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleKml(f);
                e.target.value = '';
              }}
            />
          </label>
          <select
            className="rounded-md border border-slate-300 text-sm"
            value={tile}
            onChange={(e) => setTile(e.target.value as TileLayerId)}
          >
            <option value="osm">OSM</option>
            <option value="satellite">Satellite</option>
            <option value="topo">OpenTopoMap</option>
          </select>
          {tracks.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
            >
              {t.name} ({t.totalKm.toFixed(1)} km)
              <button
                type="button"
                className="text-slate-400 hover:text-brand-red"
                onClick={async () => {
                  await deleteTrackDb(t.id);
                  setTracks((prev) => prev.filter((x) => x.id !== t.id));
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {phase === 'spotinfo' && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          SpotInfo: Ist-Positionen nach dem Event — gleiche Karte, GPX für KM. (Erweiterte
          Erfassung wie v1 folgt.)
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_280px]">
        <div className="min-h-[320px] overflow-hidden rounded-lg border border-slate-200">
          <Suspense fallback={<div className="flex h-full items-center justify-center">Karte…</div>}>
            <EventMap
              tracks={tracks}
              spots={spots}
              tileLayer={tile}
              onMapClick={phase === 'planning' ? openNewSpot : openNewSpot}
              onSpotDrag={onSpotDrag}
            />
          </Suspense>
        </div>
        <aside className="flex flex-col gap-3 overflow-y-auto">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-semibold text-navy">Spots ({spots.length})</h3>
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
              {spots.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="w-full text-left font-bold text-brand-red"
                    onClick={() => openEditSpot(s)}
                  >
                    {s.kuerzel}
                  </button>
                  <p className="text-xs text-slate-500">
                    {s.kmResults.map((k) => `${k.trackName} ${k.km.toFixed(1)}km`).join(' · ') ||
                      'Kein GPX'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <HistoricalPanel
            prevEventId={prevEventId}
            catalogYears={catalogYears}
          />
        </aside>
      </div>

      <SpotModal
        open={modalOpen}
        kuerzel={draftKuerzel}
        lat={draftLat}
        lng={draftLng}
        kmResults={draftKm}
        onKuerzelChange={setDraftKuerzel}
        onClose={() => setModalOpen(false)}
        onSave={() => void persistSpot()}
        onDelete={editId ? () => void removeSpot() : undefined}
      />
    </div>
  );
}
