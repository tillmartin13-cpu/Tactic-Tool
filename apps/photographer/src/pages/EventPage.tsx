import { type TileLayerId } from '@sg/map';
import { extractCoords, isShortUrl } from '@sg/gpx';
import { Button } from '@sg/ui';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { loadMyCameraCheck, submitCameraCheck } from '../lib/cameraCheck';
import { loadMySpots, loadTacticPdf, type MySpotView } from '../lib/photo-events';
import { loadEventTracks, loadMyReport, submitSpotReport } from '../lib/spotReport';

const EventMap = lazy(() => import('@sg/map').then((m) => ({ default: m.EventMap })));

export function EventPage() {
  const { eventUuid } = useParams<{ eventUuid: string }>();
  const { profile } = useAuth();
  const [spots, setSpots] = useState<MySpotView[]>([]);
  const [tactic, setTactic] = useState<{ name: string; url: string } | null>(null);
  const [camera, setCamera] = useState<Awaited<ReturnType<typeof loadMyCameraCheck>>>(null);
  const [report, setReport] = useState<Awaited<ReturnType<typeof loadMyReport>>>(null);
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState('');
  const [tile, setTile] = useState<TileLayerId>('satellite');

  useEffect(() => {
    if (!eventUuid || !profile) return;
    void Promise.all([
      loadMySpots(eventUuid, profile.id),
      loadTacticPdf(eventUuid),
      loadMyCameraCheck(eventUuid, profile.id),
      loadMyReport(eventUuid, profile.id),
    ]).then(([s, t, c, r]) => {
      setSpots(s);
      setTactic(t);
      setCamera(c);
      setReport(r);
    });
  }, [eventUuid, profile]);

  async function onCameraFile(file: File) {
    if (!eventUuid || !profile) return;
    await submitCameraCheck(eventUuid, profile.id, file);
    setCamera(await loadMyCameraCheck(eventUuid, profile.id));
    setMsg('Kamera-Check eingereicht');
  }

  async function submitReportFromPaste() {
    if (!eventUuid || !profile) return;
    const tracks = await loadEventTracks(eventUuid);
    let lat: number;
    let lng: number;
    if (isShortUrl(paste)) {
      const res = await fetch(`/api/resolve-location?url=${encodeURIComponent(paste)}`);
      const data = await res.json();
      if (!data.lat) throw new Error('URL nicht aufgelöst');
      lat = data.lat;
      lng = data.lng;
    } else {
      const c = extractCoords(paste);
      if (!c) throw new Error('Keine Koordinaten');
      lat = c.lat;
      lng = c.lng;
    }
    await submitSpotReport(eventUuid, profile.id, lat, lng, tracks);
    setReport(await loadMyReport(eventUuid, profile.id));
    setMsg('Spot-Report gesendet');
  }

  const mapSpots = spots.map((s) => ({
    id: s.spotId,
    kuerzel: s.kuerzel,
    lat: s.lat,
    lng: s.lng,
  }));

  return (
    <div className="photo-page">
      <Link to="/" className="inline-flex min-h-10 items-center text-sm font-medium text-navy underline">
        ← Events
      </Link>

      <div className="photo-map">
        <Suspense fallback={<p className="p-4 text-sm text-slate-500">Karte…</p>}>
          <EventMap tracks={[]} spots={mapSpots} tileLayer={tile} readOnly />
        </Suspense>
      </div>
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
        value={tile}
        onChange={(e) => setTile(e.target.value as TileLayerId)}
        aria-label="Kartenlayer"
      >
        <option value="satellite">Satellit</option>
        <option value="osm">OSM</option>
      </select>

      {spots.map((s) => (
        <section key={s.spotId} className="photo-card">
          <h2 className="text-xl font-bold text-brand-red">{s.kuerzel}</h2>
          {s.layer && <p className="text-sm text-slate-500">Station: {s.layer}</p>}
          {s.comment && <p className="mt-2 text-base leading-snug text-slate-800">{s.comment}</p>}
          <p className="mt-1 text-sm text-slate-500">
            {s.kmResults.map((k) => `${k.trackName} ${k.km.toFixed(1)} km`).join(' · ')}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              className="photo-action bg-navy text-center text-white"
              href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Navigate
            </a>
            <a
              className="photo-action bg-streetview text-center text-white"
              href={`https://www.google.com/maps?layer=c&cbll=${s.lat},${s.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Street View
            </a>
            <a
              className="photo-action bg-mapillary text-center text-white"
              href={`https://www.mapillary.com/app/?lat=${s.lat}&lng=${s.lng}&z=17`}
              target="_blank"
              rel="noreferrer"
            >
              Mapillary
            </a>
          </div>
        </section>
      ))}

      {tactic && (
        <a
          href={tactic.url}
          target="_blank"
          rel="noreferrer"
          className="photo-card block text-center text-base font-semibold text-navy"
        >
          📄 {tactic.name} herunterladen
        </a>
      )}

      <section className="photo-card">
        <h3 className="text-lg font-semibold text-navy">Kamera-Check</h3>
        <p className="mt-1 text-base text-slate-600">
          Status: {camera?.status ?? 'noch nicht eingereicht'}
          {camera?.rejection_comment ? ` — ${camera.rejection_comment}` : ''}
        </p>
        <label className="mt-3 flex">
          <span className="photo-action w-full cursor-pointer bg-navy text-white">
            Foto hochladen
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onCameraFile(f);
            }}
          />
        </label>
      </section>

      <section className="photo-card">
        <h3 className="text-lg font-semibold text-navy">SpotInfo (Ist-Position)</h3>
        {report && (
          <p className="mt-1 text-sm text-slate-500">
            Gemeldet: {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
          </p>
        )}
        <textarea
          className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-base"
          rows={3}
          placeholder="Google Maps Link oder Koordinaten"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <Button size="touch" className="mt-3 w-full" onClick={() => void submitReportFromPaste()}>
          Position melden
        </Button>
      </section>

      {msg && <p className="rounded-lg bg-green-50 px-3 py-2 text-base text-green-800">{msg}</p>}
    </div>
  );
}
