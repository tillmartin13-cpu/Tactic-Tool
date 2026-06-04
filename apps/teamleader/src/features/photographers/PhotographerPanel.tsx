import { canEditSpots, type UserRole } from '@sg/auth';
import { Button } from '@sg/ui';
import { useMemo, useState } from 'react';
import type { PhotographerProfile } from '../../types/event';
import {
  PHOTOGRAPHER_DRAG_TYPE,
  photographerDisplayKuerzel,
} from '../../lib/photographers';

interface PhotographerPanelProps {
  eventPhotographers: PhotographerProfile[];
  allPhotographers: PhotographerProfile[];
  canEdit: boolean;
  onAddToEvent: (photographerId: string) => void;
  onRemoveFromEvent: (photographerId: string) => void;
}

export function PhotographerPanel({
  eventPhotographers,
  allPhotographers,
  canEdit,
  onAddToEvent,
  onRemoveFromEvent,
}: PhotographerPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const available = useMemo(
    () =>
      allPhotographers.filter(
        (p) => !eventPhotographers.some((e) => e.id === p.id),
      ),
    [allPhotographers, eventPhotographers],
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy">
          Fotografen ({eventPhotographers.length})
        </h3>
        {canEdit && (
          <Button
            variant="secondary"
            className="!px-2 !py-1 text-xs"
            onClick={() => setPickerOpen(!pickerOpen)}
          >
            +
          </Button>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Auf Spot ziehen zum Zuweisen
      </p>

      {pickerOpen && canEdit && (
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          {available.length === 0 ? (
            <p className="text-xs text-slate-500">Keine weiteren Fotografen im System.</p>
          ) : (
            <ul className="max-h-32 space-y-1 overflow-y-auto">
              {available.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full rounded px-2 py-1 text-left text-xs hover:bg-white"
                    onClick={() => {
                      onAddToEvent(p.id);
                      setPickerOpen(false);
                    }}
                  >
                    {photographerDisplayKuerzel(p)} — {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ul className="mt-2 space-y-2">
        {eventPhotographers.length === 0 ? (
          <li className="text-xs text-slate-500">Noch keine Fotografen am Event.</li>
        ) : (
          eventPhotographers.map((p) => (
            <li key={p.id}>
              <PhotographerDragCard
                photographer={p}
                canEdit={canEdit}
                onRemove={() => onRemoveFromEvent(p.id)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function PhotographerDragCard({
  photographer,
  canEdit,
  onRemove,
}: {
  photographer: PhotographerProfile;
  canEdit: boolean;
  onRemove: () => void;
}) {
  const label = photographerDisplayKuerzel(photographer);

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => {
        e.dataTransfer.setData(PHOTOGRAPHER_DRAG_TYPE, photographer.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-2 py-2 ${
        canEdit
          ? 'cursor-grab border-navy/25 bg-navy/5 active:cursor-grabbing'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <span className="rounded-md bg-brand-red px-2 py-0.5 text-xs font-black text-white">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{photographer.name}</span>
      {canEdit && (
        <button
          type="button"
          className="shrink-0 text-slate-400 hover:text-brand-red"
          title="Vom Event entfernen"
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function canAssignPhotographers(role: UserRole | null | undefined): boolean {
  return role != null && canEditSpots(role);
}
