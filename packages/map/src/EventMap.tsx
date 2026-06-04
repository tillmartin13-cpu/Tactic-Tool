import { kmResultsForPoint, snapToTrack, type Track } from '@sg/gpx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { TrackOverlays } from './TrackOverlays';
import { buildSpotDivIcon } from './spotIcon';

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

function FitBounds({ tracks, spots }: { tracks: Track[]; spots: MapSpot[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = [
      ...tracks.flatMap((t) => t.points.map((p) => [p.lat, p.lng] as [number, number])),
      ...spots.map((s) => [s.lat, s.lng] as [number, number]),
    ];
    if (pts.length) map.fitBounds(pts, { padding: [24, 24] });
    else map.setView([51, 10], 5);
  }, [map, tracks, spots]);
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
  onSpotClick?: (id: string) => void;
  onSpotDrag?: (id: string, lat: number, lng: number) => void;
  scrubPoint?: { lat: number; lng: number; color?: string } | null;
  readOnly?: boolean;
}

export function EventMap({
  tracks,
  spots,
  tileLayer = 'osm',
  onMapClick,
  onSpotClick,
  onSpotDrag,
  scrubPoint,
  readOnly = false,
}: EventMapProps) {
  const tile = TILES[tileLayer];

  const spotMarkers = useMemo(
    () =>
      spots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={buildSpotDivIcon(s.kuerzel)}
          draggable={!readOnly && !!onSpotDrag}
          zIndexOffset={500}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onSpotClick?.(s.id);
            },
            dragend: (e) => {
              const m = e.target;
              const ll = m.getLatLng();
              onSpotDrag?.(s.id, ll.lat, ll.lng);
            },
          }}
        />
      )),
    [spots, readOnly, onSpotDrag, onSpotClick],
  );

  return (
    <MapContainer
      className="h-full w-full rounded-lg"
      center={[51, 10]}
      zoom={6}
      scrollWheelZoom
    >
      <TileLayer url={tile.url} attribution={tile.attribution} />
      <FitBounds tracks={tracks} spots={spots} />
      {!readOnly && onMapClick ? <MapClickHandler onMapClick={onMapClick} /> : null}
      <TrackOverlays tracks={tracks} />
      {spotMarkers}
      {scrubPoint ? (
        <CircleMarker
          center={[scrubPoint.lat, scrubPoint.lng]}
          radius={8}
          pathOptions={{
            color: '#fff',
            fillColor: scrubPoint.color ?? '#1C2B6B',
            fillOpacity: 1,
            weight: 2.5,
          }}
        />
      ) : null}
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
