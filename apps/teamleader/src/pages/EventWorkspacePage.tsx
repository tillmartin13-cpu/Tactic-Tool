import { rematchSpot, type TileLayerId } from '@sg/map';
import { parseKML, parseKMZ, trackColor, type Track } from '@sg/gpx';
import { KMLPreviewModal, useToast, type KMLPreviewSpot } from '@sg/ui';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SpotModal } from '../components/SpotModal';
import { CameraCheckPanel } from '../features/camera-check/CameraCheckPanel';
import { CarpoolPanel } from '../features/carpool/CarpoolPanel';
import { HistoricalPanel } from '../features/history/HistoricalPanel';
import { LayersPanel } from '../features/layers/LayersPanel';
import { EventSettingsPanel } from '../features/settings/EventSettingsPanel';
import { SpotInfoPanel } from '../features/spotinfo/SpotInfoPanel';
import { TeamCommsPanel } from '../features/team-comms/TeamCommsPanel';
import {
  canAssignPhotographersForEvent,
  PhotographerPanel,
} from '../features/photographers/PhotographerPanel';
import { eventAccessFor, canEditEventPlanning } from '@sg/auth';
import { SpotDropTarget } from '../features/photographers/SpotDropTarget';
import {
  addEventPhotographer,
  assignPhotographerToSpot,
  attachAssignmentsToSpots,
  listAllPhotographers,
  listEventPhotographers,
  loadSpotAssignmentsForEvent,
  photographerDisplayKuerzel,
  removeEventPhotographer,
  spotPinLabel,
  unassignPhotographerFromSpot,
} from '../lib/photographers';
import { useAuth } from '../lib/auth';
import {
  deleteSpotDb,
  deleteTrackDb,
  listCatalogYears,
  loadEventWorkspace,
  saveSpot,
  uploadTrack,
} from '../lib/events';
import type { EventPhase, EventIntent, PhotographerProfile, WorkspaceSpot } from '../types/event';

const EventMap = lazy(() =>
  import('@sg/map').then((m) => ({ default: m.EventMap })),
);
const ElevationChart = lazy(() =>
  import('@sg/map').then((m) => ({ default: m.ElevationChart })),
);

export function EventWorkspacePage() {
  const { eventUuid } = useParams<{ eventUuid: string }>();
  const { toast } = useToast();
  const { profile, membership, bypassAuth } = useAuth();
  const eventAccess =
    eventUuid && profile
      ? eventAccessFor(eventUuid, profile.role, membership)
      : bypassAuth
        ? 'admin'
        : 'none';
  const canEdit = bypassAuth || canEditEventPlanning(eventAccess);
  const canAssign = canEdit;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sportografId, setSportografId] = useState('');
  const [eventName, setEventName] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [prevEventId, setPrevEventId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [draftLayer, setDraftLayer] = useState('');
  const [phase, setPhase] = useState<EventPhase>('planning');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [spots, setSpots] = useState<WorkspaceSpot[]>([]);
  const [tile, setTile] = useState<TileLayerId>('osm');
  const [catalogYears, setCatalogYears] = useState<number[]>([]);
  const [scrubPoint, setScrubPoint] = useState<{
    lat: number;
    lng: number;
    color?: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draftKuerzel, setDraftKuerzel] = useState('');
  const [draftLat, setDraftLat] = useState(0);
  const [draftLng, setDraftLng] = useState(0);

  const [kmlPreview, setKmlPreview] = useState<KMLPreviewSpot[]>([]);
  const [kmlSelected, setKmlSelected] = useState<Set<number>>(new Set());
  const [kmlOpen, setKmlOpen] = useState(false);
  const [eventPhotographers, setEventPhotographers] = useState<PhotographerProfile[]>([]);
  const [allPhotographers, setAllPhotographers] = useState<PhotographerProfile[]>([]);

  const mapSpots = useMemo(
    () =>
      spots.map((s) => ({
        id: s.id,
        kuerzel: spotPinLabel(s),
        lat: s.lat,
        lng: s.lng,
      })),
    [spots],
  );

  const editSpot = editId ? spots.find((s) => s.id === editId) : null;

  const load = useCallback(async () => {
    if (!eventUuid) return;
    setLoading(true);
    try {
      const { event, tracks: t, spots: baseSpots } = await loadEventWorkspace(eventUuid);
      const [assignments, evPh, allPh] = await Promise.all([
        loadSpotAssignmentsForEvent(eventUuid),
        listEventPhotographers(eventUuid),
        listAllPhotographers(),
      ]);
      setSportografId(event.event_id);
      setEventName(event.name);
      setEventType(event.type);
      setWhatsappUrl(event.whatsapp_group_invite_url ?? null);
      setPrevEventId(event.prev_event_id);
      setTracks(t);
      setSpots(attachAssignmentsToSpots(baseSpots, assignments));
      setEventPhotographers(evPh);
      setAllPhotographers(allPh);
      const stored = sessionStorage.getItem(`tactic_intent_${eventUuid}`) as EventIntent | null;
      const i = stored === 'spotinfo_focus' ? 'spotinfo_focus' : 'full';
      setPhase(i === 'spotinfo_focus' && !t.length && !s.length ? 'spotinfo' : 'planning');
      setCatalogYears(await listCatalogYears());
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
    setDraftComment('');
    setDraftLayer('');
    setDraftLat(m.lat);
    setDraftLng(m.lng);
    setModalOpen(true);
  }

  function openEditSpot(spot: WorkspaceSpot) {
    setEditId(spot.id);
    setDraftKuerzel(spot.kuerzel);
    setDraftComment(spot.comment ?? '');
    setDraftLayer(spot.layer ?? '');
    setDraftLat(spot.lat);
    setDraftLng(spot.lng);
    setModalOpen(true);
  }

  function openEditById(id: string) {
    const s = spots.find((x) => x.id === id);
    if (s) openEditSpot(s);
  }

  async function handleGpx(files: FileList | null) {
    if (!files?.length || !eventUuid) return;
    for (let i = 0; i < files.length; i++) {
      await uploadTrack(eventUuid, files[i], tracks.length + i);
    }
    toast('GPX geladen');
    const ws = await loadEventWorkspace(eventUuid);
    setTracks(ws.tracks);
    setSpots(ws.spots);
    if (ws.spots.length) {
      for (const s of ws.spots) {
        const m = rematchSpot(s.lat, s.lng, ws.tracks);
        await saveSpot(
          eventUuid,
          { kuerzel: s.kuerzel, lat: m.lat, lng: m.lng, kmResults: m.kmResults },
          s.id,
        );
      }
      await load();
      toast('Spots an GPX angepasst');
    }
  }

  async function handleKmlFile(file: File) {
    let rawSpots: KMLPreviewSpot[] = [];
    if (file.name.toLowerCase().endsWith('.kmz')) {
      const kml = await parseKMZ(await file.arrayBuffer());
      rawSpots = parseKML(kml, tracks).map((s) => ({
        name: s.name,
        lat: s.lat,
        lng: s.lng,
      }));
    } else {
      rawSpots = parseKML(await file.text(), tracks).map((s) => ({
        name: s.name,
        lat: s.lat,
        lng: s.lng,
      }));
    }
    if (!rawSpots.length) {
      toast('Keine Placemarks in der Datei');
      return;
    }
    setKmlPreview(rawSpots);
    setKmlSelected(new Set(rawSpots.map((_, i) => i)));
    setKmlOpen(true);
  }

  async function confirmKmlImport() {
    if (!eventUuid) return;
    const picked = kmlPreview.filter((_, i) => kmlSelected.has(i));
    for (const k of picked) {
      const m = rematchSpot(k.lat, k.lng, tracks);
      const saved = await saveSpot(eventUuid, {
        kuerzel: k.name,
        lat: m.lat,
        lng: m.lng,
        kmResults: m.kmResults,
      });
      setSpots((prev) => [...prev, saved]);
    }
    setKmlOpen(false);
    toast(`${picked.length} Spots importiert`);
  }

  async function persistSpot(payload: {
    kuerzel: string;
    lat: number;
    lng: number;
    kmResults: WorkspaceSpot['kmResults'];
  }) {
    if (!eventUuid || !payload.kuerzel.trim()) {
      toast('Bitte Kürzel eingeben');
      return;
    }
    const saved = await saveSpot(
      eventUuid,
      { ...payload, comment: draftComment || null, layer: draftLayer || null },
      editId ?? undefined,
    );
    const prevAssign = editId ? spots.find((s) => s.id === editId)?.assignments ?? [] : [];
    const merged = { ...saved, assignments: prevAssign };
    if (editId) {
      setSpots((prev) => prev.map((s) => (s.id === editId ? merged : s)));
    } else {
      setSpots((prev) => [...prev, merged]);
    }
    setModalOpen(false);
    toast(`Spot „${payload.kuerzel}" gespeichert`);
  }

  async function handleAssignPhotographer(spotId: string, photographerId: string) {
    const row = await assignPhotographerToSpot(spotId, photographerId);
    const label = photographerDisplayKuerzel(row.photographer);
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id !== spotId) return s;
        if (s.assignments.some((a) => a.photographerId === photographerId)) return s;
        return {
          ...s,
          assignments: [
            ...s.assignments,
            {
              assignmentId: row.id,
              photographerId: row.photographerId,
              name: row.photographer.name,
              kuerzel: row.photographer.kuerzel,
            },
          ],
        };
      }),
    );
    toast(`${label} zugewiesen`);
  }

  async function handleUnassign(assignmentId: string) {
    await unassignPhotographerFromSpot(assignmentId);
    setSpots((prev) =>
      prev.map((s) => ({
        ...s,
        assignments: s.assignments.filter((a) => a.assignmentId !== assignmentId),
      })),
    );
    toast('Zuweisung entfernt');
  }

  async function handleAddEventPhotographer(photographerId: string) {
    if (!eventUuid) return;
    await addEventPhotographer(eventUuid, photographerId);
    const p = allPhotographers.find((x) => x.id === photographerId);
    if (p) setEventPhotographers((prev) => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)));
    toast('Fotograf zum Event hinzugefügt');
  }

  async function handleRemoveEventPhotographer(photographerId: string) {
    if (!eventUuid) return;
    await removeEventPhotographer(eventUuid, photographerId);
    setEventPhotographers((prev) => prev.filter((p) => p.id !== photographerId));
    toast('Fotograf vom Event entfernt');
  }

  async function removeSpot() {
    if (!editId) return;
    await deleteSpotDb(editId);
    setSpots((prev) => prev.filter((s) => s.id !== editId));
    setModalOpen(false);
    toast('Spot entfernt');
  }

  async function onSpotDrag(id: string, lat: number, lng: number) {
    const m = rematchSpot(lat, lng, tracks);
    const spot = spots.find((s) => s.id === id);
    if (!spot || !eventUuid) return;
    const saved = await saveSpot(
      eventUuid,
      {
        kuerzel: spot.kuerzel,
        lat: m.lat,
        lng: m.lng,
        kmResults: m.kmResults,
      },
      id,
    );
    setSpots((prev) =>
      prev.map((s) => (s.id === id ? { ...saved, assignments: s.assignments } : s)),
    );
    toast(`Spot „${spot.kuerzel}" aktualisiert`);
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

  const galleryUrl = prevEventId
    ? `https://www.sportograf.com/de/gallery/${prevEventId}`
    : null;

  return (
    <div className="tl-workspace">
      <div className="tl-toolbar flex flex-wrap items-center gap-2">
        <Link to="/" className="text-sm text-navy underline">
          ← Events
        </Link>
        <span className="font-semibold text-navy">{sportografId}</span>
        {profile && eventAccess !== 'none' && (
          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy">
            {eventAccess === 'teamleader'
              ? 'Teamleiter'
              : eventAccess === 'office'
                ? 'Office'
                : eventAccess === 'admin'
                  ? 'Admin'
                  : 'Lesen'}
          </span>
        )}
        {galleryUrl && (
          <a
            href={galleryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-navy underline"
          >
            Vorjahresgalerie
          </a>
        )}
        <div className="ml-auto flex shrink-0 rounded-lg border border-slate-200 p-0.5">
          {(['planning', 'spotinfo'] as EventPhase[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-semibold sm:min-h-8 sm:py-1 ${
                phase === p ? 'bg-navy text-white' : 'text-slate-600'
              }`}
            >
              {p === 'planning' ? 'Planung' : 'SpotInfo'}
            </button>
          ))}
        </div>
      </div>

      {eventAccess === 'office' && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          Office-Ansicht: Planung ansehen, keine Bearbeitung.
        </p>
      )}

      {phase === 'planning' && canEdit && (
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
              onChange={(e) => {
                void handleGpx(e.target.files);
                e.target.value = '';
              }}
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
                if (f) void handleKmlFile(f);
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
          {tracks.map((t, i) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: t.color ?? trackColor(i) }}
              />
              {t.name} ({t.totalKm.toFixed(1)} km)
              <button
                type="button"
                className="text-slate-400 hover:text-brand-red"
                onClick={async () => {
                  await deleteTrackDb(t.id);
                  setTracks((prev) => prev.filter((x) => x.id !== t.id));
                  toast('Strecke entfernt');
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {phase === 'spotinfo' && eventUuid && (
        <SpotInfoPanel
          eventUuid={eventUuid}
          eventSportografId={sportografId}
          eventName={eventName}
          spots={spots}
        />
      )}

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(180px,220px)_1fr_minmax(240px,300px)]">
        {phase === 'planning' && canEdit && (
          <aside className="tl-side-panel order-2 flex flex-col xl:order-1 xl:overflow-y-auto">
            <PhotographerPanel
              eventPhotographers={eventPhotographers}
              allPhotographers={allPhotographers}
              canEdit={canAssign}
              onAddToEvent={(id) => void handleAddEventPhotographer(id)}
              onRemoveFromEvent={(id) => void handleRemoveEventPhotographer(id)}
            />
          </aside>
        )}

        <div className="order-1 flex min-h-[min(45dvh,28rem)] flex-col gap-2 overflow-hidden sm:min-h-[360px] xl:order-2 xl:min-h-0">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <Suspense fallback={<div className="flex h-full items-center justify-center">Karte…</div>}>
              <EventMap
                tracks={tracks}
                spots={mapSpots}
                tileLayer={tile}
                onMapClick={canEdit ? openNewSpot : undefined}
                onSpotClick={canEdit ? openEditById : undefined}
                onSpotDrag={phase === 'planning' && canEdit ? onSpotDrag : undefined}
                canDropPhotographer={phase === 'planning' && canAssign}
                onPhotographerDrop={(spotId, photographerId) =>
                  void handleAssignPhotographer(spotId, photographerId)
                }
                scrubPoint={scrubPoint}
              />
            </Suspense>
          </div>
          {tracks.some((t) => t.hasEle) && (
            <Suspense fallback={null}>
              <ElevationChart
                tracks={tracks}
                onScrub={(lat, lng) => {
                  const active = tracks.find((t) => t.hasEle);
                  setScrubPoint({
                    lat,
                    lng,
                    color: active?.color ?? '#1C2B6B',
                  });
                }}
                onScrubEnd={() => setScrubPoint(null)}
              />
            </Suspense>
          )}
        </div>
        <aside className="tl-side-panel order-3 flex flex-col gap-3 xl:max-h-none xl:overflow-y-auto">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-navy">Spots ({spots.length})</h3>
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm xl:max-h-64">
              {spots.map((s) => (
                <li key={s.id}>
                  <SpotDropTarget
                    spotId={s.id}
                    canDrop={phase === 'planning' && canAssign}
                    onDropPhotographer={(spotId, photographerId) =>
                      void handleAssignPhotographer(spotId, photographerId)
                    }
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => openEditSpot(s)}
                    >
                      <span className="font-bold text-brand-red">{spotPinLabel(s)}</span>
                      {s.assignments.length > 0 && spotPinLabel(s) !== s.kuerzel && (
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          ({s.kuerzel})
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-slate-500">
                      {s.kmResults.map((k) => `${k.trackName} ${k.km.toFixed(1)}km`).join(' · ') ||
                        'Kein GPX'}
                    </p>
                  </SpotDropTarget>
                </li>
              ))}
            </ul>
          </div>
          {eventUuid && (
            <EventSettingsPanel
              eventUuid={eventUuid}
              eventName={eventName}
              whatsappUrl={whatsappUrl}
              canEdit={canEdit}
            />
          )}
          {eventUuid && <CameraCheckPanel eventUuid={eventUuid} canEdit={canEdit} />}
          {eventUuid && profile && (
            <TeamCommsPanel
              eventUuid={eventUuid}
              role={profile.role}
              whatsappUrl={whatsappUrl}
              canEdit={canEdit}
            />
          )}
          {eventUuid && profile && <CarpoolPanel eventUuid={eventUuid} role={profile.role} />}
          {eventUuid && (
            <LayersPanel
              eventUuid={eventUuid}
              eventType={eventType}
              canEdit={canEdit}
              onLayerPick={(name) => setDraftLayer(name)}
            />
          )}
          <HistoricalPanel prevEventId={prevEventId} catalogYears={catalogYears} />
        </aside>
      </div>

      <SpotModal
        open={modalOpen}
        kuerzel={draftKuerzel}
        lat={draftLat}
        lng={draftLng}
        tracks={tracks}
        assignments={editSpot?.assignments}
        eventPhotographers={eventPhotographers}
        canAssign={canAssign && !!editId && eventAccess !== 'office'}
        onAssignPhotographer={
          editId
            ? (photographerId) => void handleAssignPhotographer(editId, photographerId)
            : undefined
        }
        onUnassignPhotographer={(id) => void handleUnassign(id)}
        comment={draftComment}
        layer={draftLayer}
        eventType={eventType}
        onKuerzelChange={setDraftKuerzel}
        onCommentChange={setDraftComment}
        onLayerChange={setDraftLayer}
        onClose={() => setModalOpen(false)}
        onSave={(p) => void persistSpot(p)}
        onDelete={editId ? () => void removeSpot() : undefined}
      />

      <KMLPreviewModal
        open={kmlOpen}
        spots={kmlPreview}
        selected={kmlSelected}
        onToggle={(i) => {
          setKmlSelected((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
          });
        }}
        onSelectAll={() => setKmlSelected(new Set(kmlPreview.map((_, i) => i)))}
        onSelectNone={() => setKmlSelected(new Set())}
        onConfirm={() => void confirmKmlImport()}
        onClose={() => setKmlOpen(false)}
      />
    </div>
  );
}
