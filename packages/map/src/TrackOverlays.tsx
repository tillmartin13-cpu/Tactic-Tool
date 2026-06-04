import { trackColor, type Track } from '@sg/gpx';
import L from 'leaflet';
import { Marker, Polyline } from 'react-leaflet';
import { getDirectionArrowPositions } from './directionArrows';
import { finishFlagIcon } from './spotIcon';

function arrowIcon(color: string, rotationDeg: number) {
  const html = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
    <polygon points="7,1 11,11 7,8 3,11" fill="${color}" opacity="0.65"
      stroke="rgba(255,255,255,0.5)" stroke-width="0.8" stroke-linejoin="round"
      transform="rotate(${rotationDeg.toFixed(1)},7,7)"/></svg>`;
  return L.divIcon({
    className: '',
    html,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface TrackOverlaysProps {
  tracks: Track[];
}

export function TrackOverlays({ tracks }: TrackOverlaysProps) {
  return (
    <>
      {tracks.map((t, i) => {
        const col = t.color ?? trackColor(i);
        const lls = t.points.map((p) => [p.lat, p.lng] as [number, number]);
        if (!lls.length) return null;
        const arrows = getDirectionArrowPositions(t);
        return (
          <span key={t.id}>
            <Polyline positions={lls} pathOptions={{ color: col, weight: 5, opacity: 0.85 }} />
            <Marker
              position={lls[0]}
              icon={L.divIcon({
                className: '',
                html: '<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
              zIndexOffset={300}
            />
            <Marker position={lls[lls.length - 1]} icon={finishFlagIcon} zIndexOffset={400} />
            {arrows.map((a, ai) => (
              <Marker
                key={`${t.id}-arr-${ai}`}
                position={[a.lat, a.lng]}
                icon={arrowIcon(col, a.rotationDeg)}
                interactive={false}
                zIndexOffset={-200}
              />
            ))}
          </span>
        );
      })}
    </>
  );
}
