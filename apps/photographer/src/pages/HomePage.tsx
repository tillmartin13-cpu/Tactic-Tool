import { useAuth } from '../lib/auth';
import { listPhotographerEvents } from '../lib/photo-events';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { membership } = useAuth();
  const [events, setEvents] = useState<Awaited<ReturnType<typeof listPhotographerEvents>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listPhotographerEvents(membership)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [membership]);

  return (
    <div className="photo-page">
      <section className="photo-card">
        <h1 className="text-xl font-semibold text-navy">Meine Events</h1>
        {loading ? (
          <p className="mt-2 text-base text-slate-500">Laden…</p>
        ) : events.length === 0 ? (
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            Noch keine Zuweisung. Dein Teamleiter weist dich einem Event und Spot zu.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {events.map((ev) => (
              <li key={ev.id} className="flex flex-col gap-3 py-4 first:pt-2">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-navy">{ev.name || ev.event_id}</p>
                  <p className="text-sm text-slate-500">
                    {ev.event_id}
                    {ev.date ? ` · ${ev.date}` : ''}
                    {ev.type ? ` · ${ev.type}` : ''}
                  </p>
                </div>
                <Link
                  to={`/events/${ev.id}`}
                  className="photo-action w-full bg-navy text-center text-white"
                >
                  Öffnen
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
