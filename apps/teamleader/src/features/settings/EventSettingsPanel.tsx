import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import {
  addEventTeamleader,
  listEventTeamleaders,
  listProfilesForRole,
  removeEventTeamleader,
  updateEventMeta,
  uploadTacticPdf,
  type ProfileOption,
} from '../../lib/eventSettings';

interface EventSettingsPanelProps {
  eventUuid: string;
  eventName: string | null;
  whatsappUrl: string | null;
  canEdit: boolean;
}

export function EventSettingsPanel({
  eventUuid,
  eventName,
  whatsappUrl: initialWa,
  canEdit,
}: EventSettingsPanelProps) {
  const [wa, setWa] = useState(initialWa ?? '');
  const [tlIds, setTlIds] = useState<string[]>([]);
  const [tlPool, setTlPool] = useState<ProfileOption[]>([]);
  const [pickTl, setPickTl] = useState('');

  useEffect(() => {
    void Promise.all([
      listEventTeamleaders(eventUuid),
      listProfilesForRole('teamleader'),
      listProfilesForRole('admin'),
    ]).then(([ids, tls, admins]) => {
      setTlIds(ids);
      setTlPool([...admins, ...tls]);
    });
  }, [eventUuid]);

  useEffect(() => setWa(initialWa ?? ''), [initialWa]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">Event-Einstellungen</h3>
      {eventName && <p className="text-xs text-slate-500">{eventName}</p>}

      <div className="mt-3">
        <label className="text-xs font-medium text-slate-600">WhatsApp-Gruppe (Link)</label>
        <input
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={wa}
          disabled={!canEdit}
          onChange={(e) => setWa(e.target.value)}
        />
        {canEdit && (
          <Button
            variant="secondary"
            className="mt-1 w-full !text-xs"
            onClick={() => void updateEventMeta(eventUuid, { whatsapp_group_invite_url: wa || null })}
          >
            Speichern
          </Button>
        )}
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-slate-600">Teamleiter am Event</label>
        <ul className="mt-1 text-xs">
          {tlIds.map((id) => {
            const p = tlPool.find((x) => x.id === id);
            return (
              <li key={id} className="flex justify-between py-0.5">
                <span>{p?.name ?? id}</span>
                {canEdit && (
                  <button
                    type="button"
                    className="text-brand-red"
                    onClick={() => {
                      void removeEventTeamleader(eventUuid, id).then(() =>
                        setTlIds((prev) => prev.filter((x) => x !== id)),
                      );
                    }}
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {canEdit && (
          <div className="mt-1 flex gap-1">
            <select
              className="flex-1 rounded border text-xs"
              value={pickTl}
              onChange={(e) => setPickTl(e.target.value)}
            >
              <option value="">+ TL…</option>
              {tlPool
                .filter((p) => !tlIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
            <Button
              variant="secondary"
              className="!px-2 !text-xs"
              disabled={!pickTl}
              onClick={() => {
                void addEventTeamleader(eventUuid, pickTl).then(() => {
                  setTlIds((prev) => [...prev, pickTl]);
                  setPickTl('');
                });
              }}
            >
              +
            </Button>
          </div>
        )}
      </div>

      {canEdit && (
        <label className="mt-3 block cursor-pointer">
          <span className="text-xs font-medium text-navy">Taktik-PDF hochladen</span>
          <input
            type="file"
            accept=".pdf"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadTacticPdf(eventUuid, f);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </section>
  );
}
