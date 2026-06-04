import { MapPlaceholder } from '@sg/map';
import { AppShell, Button } from '@sg/ui';
import { Link, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-navy">Meine Events</h1>
        <p className="mt-2 text-slate-600">
          Fotografen-Frontend — Spot, Kamera-Check und Spot-Report folgen als Nächstes.
        </p>
        <Button className="mt-4">Anmelden (bald)</Button>
      </section>
      <section className="h-64 overflow-hidden rounded-lg bg-white p-2 shadow-sm">
        <MapPlaceholder label="Assigned spot" />
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AppShell title="Photographer" subtitle="Your spots at Sportograf events">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="*"
          element={
            <p className="text-slate-600">
              Seite nicht gefunden.{' '}
              <Link className="text-navy underline" to="/">
                Start
              </Link>
            </p>
          }
        />
      </Routes>
    </AppShell>
  );
}
