import { trackColor, type Track } from '@sg/gpx';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function sampleTrack(track: Track, maxPoints: number) {
  const step = Math.max(1, Math.floor(track.points.length / maxPoints));
  const pts = track.points.filter((_, i) => i % step === 0 || i === track.points.length - 1);
  const kms = track.cumKm.filter((_, i) => i % step === 0 || i === track.cumKm.length - 1);
  return { pts, kms };
}

interface ElevationChartProps {
  tracks: Track[];
  onScrub?: (lat: number, lng: number, km: number) => void;
  onScrubEnd?: () => void;
}

export function ElevationChart({ tracks, onScrub, onScrubEnd }: ElevationChartProps) {
  const withEle = useMemo(
    () => tracks.map((t, i) => ({ t, i })).filter((x) => x.t.hasEle),
    [tracks],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIdx >= withEle.length) setActiveIdx(0);
  }, [withEle.length, activeIdx]);

  if (!withEle.length) return null;

  const { t: track, i: trackIdx } = withEle[activeIdx] ?? withEle[0];
  const col = track.color ?? trackColor(trackIdx);
  const { pts, kms } = sampleTrack(track, 250);
  const miniTracks = withEle.filter((x) => x.i !== trackIdx);

  function handleMove(clientX: number) {
    const wrap = wrapRef.current;
    if (!wrap || !pts.length) return;
    const rect = wrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (pts.length - 1));
    const pt = pts[idx];
    const km = kms[idx];
    if (pt) onScrub?.(pt.lat, pt.lng, km);
  }

  const chartData = {
    labels: kms.map((k) => k.toFixed(1)),
    datasets: [
      {
        data: pts.map((p) => p.ele ?? 0),
        borderColor: col,
        borderWidth: 2,
        backgroundColor: `${col}25`,
        fill: true,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-bold" style={{ color: col }}>
          {track.name}
        </span>
        <span className="shrink-0 text-xs text-slate-400">{track.totalKm.toFixed(1)} km</span>
      </div>
      <div
        ref={wrapRef}
        className="relative h-[72px] touch-none"
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={() => onScrubEnd?.()}
        onTouchMove={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={() => onScrubEnd?.()}
      >
        <Line
          data={chartData}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
              x: { display: false },
              y: {
                display: true,
                ticks: { font: { size: 9 }, maxTicksLimit: 3, color: '#bbb' },
                grid: { color: '#f5f5f5' },
              },
            },
          }}
        />
      </div>
      {miniTracks.length > 0 && (
        <div className="mt-2 space-y-1">
          {miniTracks.map(({ t, i }) => {
            const mcol = t.color ?? trackColor(i);
            const { pts: mpts, kms: mkms } = sampleTrack(t, 80);
            return (
              <button
                key={t.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 hover:bg-slate-50"
                onClick={() => {
                  const idx = withEle.findIndex((x) => x.i === i);
                  if (idx >= 0) setActiveIdx(idx);
                }}
              >
                <span
                  className="w-20 truncate text-left text-[11px] font-bold"
                  style={{ color: mcol }}
                >
                  {t.name}
                </span>
                <span className="h-6 flex-1">
                  <Line
                    data={{
                      labels: mkms,
                      datasets: [
                        {
                          data: mpts.map((p) => p.ele ?? 0),
                          borderColor: mcol,
                          borderWidth: 1.5,
                          backgroundColor: `${mcol}20`,
                          fill: true,
                          pointRadius: 0,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      animation: false,
                      responsive: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      scales: { x: { display: false }, y: { display: false } },
                    }}
                    height={24}
                    width={120}
                  />
                </span>
                <span className="w-11 text-right text-[10px] text-slate-400">
                  {t.totalKm.toFixed(1)} km
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
