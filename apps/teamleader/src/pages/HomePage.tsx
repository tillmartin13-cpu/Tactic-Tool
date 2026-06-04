import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  createEvent,
  deleteEvent,
  listCatalogYears,
  listEvents,
  listEventsForUser,
} from '../lib/events';
import type { DbEvent, EventIntent } from '../types/event';

export function HomePage() {
  const navigate = useNavigate();
  const { profile, membership, bypassAuth } = useAuth();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [catalogYears, setCatalogYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [prevEventId, setPrevEventId] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [intent, setIntent] = useState<EventIntent>('full');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const ev =
          bypassAuth || !profile
            ? await listEvents()
            : await listEventsForUser(profile.id, profile.role, membership);
        const years = await listCatalogYears();
        setEvents(ev);
        setCatalogYears(years);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, membership, bypassAuth]);

  const canCreateEvents =
    bypassAuth ||
    profile?.role === 'admin' ||
    profile?.role === 'teamleader' ||
    membership.teamleaderEventIds.length > 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!eventId.trim()) {
      setError('Sportograf Event-ID required');
      return;
    }
    try {
      const created = await createEvent(
        {
          eventId,
          name,
          date: date || undefined,
          type: eventType || undefined,
          prevEventId: prevEventId || undefined,
          intent,
        },
        profile?.id,
      );
      sessionStorage.setItem(`tactic_intent_${created.id}`, intent);
      navigate(`/events/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured() && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Supabase not configured — add <code className="text-navy">.env</code>
        </p>
      )}

      {catalogYears.length > 0 && (
        <p className="text-sm text-slate-600">
          Archiv im System:{' '}
          {catalogYears.map((y) => (
            <span
              key={y}
              className="mr-2 inline-flex rounded-full bg-navy/10 px-2 py-0.5 font-semibold text-navy"
            >
              {y}
            </span>
          ))}
        </p>
      )}

      {canCreateEvents && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Abbrechen' : 'Neues Event'}
          </Button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-navy">Event anlegen</h2>

          <div>
            <label className="text-sm font-medium text-slate-700">Sportograf Event-ID *</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="z. B. 23040"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Datum</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Typ</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="">—</option>
                <option value="cycling">Rad</option>
                <option value="running">Lauf</option>
                <option value="obstacle">Obstacle</option>
                <option value="highrocks">High Rocks</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Vorjahr-Event-ID</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={prevEventId}
              onChange={(e) => setPrevEventId(e.target.value)}
              placeholder="z. B. 8832 — für Archiv & Galerie"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Workflow</p>
            <div className="mt-2 space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  checked={intent === 'full'}
                  onChange={() => setIntent('full')}
                />
                <span>
                  <strong>Event planen</strong> — GPX, Spots, später SpotInfo (empfohlen)
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  checked={intent === 'spotinfo_focus'}
                  onChange={() => setIntent('spotinfo_focus')}
                />
                <span>
                  <strong>SpotInfo zuerst</strong> — direkt zu Ist-Positionen; Planung jederzeit
                  nachziehbar
                </span>
              </label>
            </div>
          </div>

          {error ? <p className="text-sm text-brand-red">{error}</p> : null}
          <Button type="submit">Event erstellen</Button>
        </form>
      )}

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy">Deine Events</h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Laden…</p>
        ) : events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Noch keine Events.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-navy">
                    {ev.name || ev.event_id}{' '}
                    <span className="font-mono text-sm text-slate-500">({ev.event_id})</span>
                  </p>
                  {ev.prev_event_id ? (
                    <p className="text-xs text-slate-500">Vorjahr: {ev.prev_event_id}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  {ev.prev_event_id ? (
                    <a
                      href={`https://www.sportograf.com/de/gallery/${ev.prev_event_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-navy underline"
                    >
                      Galerie
                    </a>
                  ) : null}
                  <Link
                    to={`/events/${ev.id}`}
                    className="rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy/90"
                  >
                    Öffnen
                  </Link>
                  <button
                    type="button"
                    className="text-xs text-brand-red underline"
                    onClick={async () => {
                      if (!confirm(`Event ${ev.event_id} wirklich löschen?`)) return;
                      await deleteEvent(ev.id);
                      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
