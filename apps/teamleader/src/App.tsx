import { AppShell } from '@sg/ui';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EventWorkspacePage } from './pages/EventWorkspacePage';

export default function App() {
  return (
    <AppShell title="Teamleader" subtitle="Tactic Tool — Event planen & SpotInfo">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:eventUuid" element={<EventWorkspacePage />} />
      </Routes>
    </AppShell>
  );
}
