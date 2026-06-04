import { kmResultsForPoint, snapToTrack, trackColor, type Track } from '@sg/gpx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';

export type TileLayerId = 'osm' | 'satellite' | 'topo';

const TILES: Record<TileLayerId, { url: string; attribution: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
};

function FitBounds({ tracks }: { tracks: Track[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = tracks.flatMap((t) => t.points.map((p) => [p.lat, p.lng] as [number, number]));
    if (pts.length) map.fitBounds(pts, { padding: [24, 24] });
    else map.setView([51, 10], 5);
  }, [map, tracks]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function spotIcon(kuerzel: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#CC2B2B;color:#fff;border-radius:8px;padding:4px 10px;font-size:13px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.25);transform:translate(-50%,-100%)">${kuerzel}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export interface MapSpot {
  id: string;
  kuerzel: string;
  lat: number;
  lng: number;
}

interface EventMapProps {
  tracks: Track[];
  spots: MapSpot[];
  tileLayer?: TileLayerId;
  onMapClick?: (lat: number, lng: number) => void;
  onSpotDrag?: (id: string, lat: number, lng: number) => void;
  readOnly?: boolean;
}

export function EventMap({
  tracks,
  spots,
  tileLayer = 'osm',
  onMapClick,
  onSpotDrag,
  readOnly = false,
}: EventMapProps) {
  const tile = TILES[tileLayer];

  const spotMarkers = useMemo(
    () =>
      spots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={spotIcon(s.kuerzel)}
          draggable={!readOnly && !!onSpotDrag}
          eventHandlers={{
            dragend: (e) => {
              const m = e.target;
              const ll = m.getLatLng();
              onSpotDrag?.(s.id, ll.lat, ll.lng);
            },
          }}
        />
      )),
    [spots, readOnly, onSpotDrag],
  );

  return (
    <MapContainer
      className="h-full w-full rounded-lg"
      center={[51, 10]}
      zoom={6}
      scrollWheelZoom
    >
      <TileLayer url={tile.url} attribution={tile.attribution} />
      <FitBounds tracks={tracks} />
      {!readOnly && onMapClick ? <MapClickHandler onMapClick={onMapClick} /> : null}
      {tracks.map((t, i) => (
        <Polyline
          key={t.id}
          positions={t.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{
            color: t.color ?? trackColor(i),
            weight: 5,
            opacity: 0.85,
          }}
        />
      ))}
      {spotMarkers}
    </MapContainer>
  );
}

export function rematchSpot(
  lat: number,
  lng: number,
  tracks: Track[],
): { lat: number; lng: number; kmResults: ReturnType<typeof kmResultsForPoint> } {
  const snapped = snapToTrack(lat, lng, tracks);
  return {
    lat: snapped.lat,
    lng: snapped.lng,
    kmResults: kmResultsForPoint(snapped.lat, snapped.lng, tracks),
  };
}
