import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import { createEventLayer, deleteEventLayer, listEventLayers, type EventLayer } from '../../lib/layers';

export function LayersPanel({
  eventUuid,
  eventType,
  canEdit,
  onLayerPick,
}: {
  eventUuid: string;
  eventType: string | null;
  canEdit: boolean;
  onLayerPick?: (name: string) => void;
}) {
  const [layers, setLayers] = useState<EventLayer[]>([]);
  const [name, setName] = useState('');

  const active = eventType === 'obstacle' || eventType === 'highrocks';

  useEffect(() => {
    if (active) void listEventLayers(eventUuid).then(setLayers);
  }, [eventUuid, active]);

  if (!active) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">Stationen / Obstacles</h3>
      {canEdit && (
        <div className="mt-2 flex gap-1">
          <input
            className="flex-1 rounded border px-2 py-1 text-xs"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="secondary"
            className="!text-xs"
            onClick={() => {
              if (!name.trim()) return;
              void createEventLayer(eventUuid, name.trim()).then((l) => {
                setLayers((prev) => [...prev, l]);
                setName('');
              });
            }}
          >
            +
          </Button>
        </div>
      )}
      <ul className="mt-2 space-y-1 text-xs">
        {layers.map((l) => (
          <li key={l.id} className="flex justify-between">
            <button type="button" className="text-left text-navy underline" onClick={() => onLayerPick?.(l.name)}>
              {l.name}
            </button>
            {canEdit && (
              <button
                type="button"
                className="text-brand-red"
                onClick={() => void deleteEventLayer(l.id).then(() => setLayers((p) => p.filter((x) => x.id !== l.id)))}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
