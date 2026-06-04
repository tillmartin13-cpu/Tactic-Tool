import { AppShell, ToastProvider } from '@sg/ui';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider, useAuth } from './lib/auth';
import { EventWorkspacePage } from './pages/EventWorkspacePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

function AppHeader() {
  const { session, profile, signOut, bypassAuth } = useAuth();
  if (bypassAuth || !session) return null;
  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="text-xs text-white/80 underline hover:text-white"
    >
      {profile?.name ?? 'Abmelden'}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell
          title="Teamleader"
          subtitle="Tactic Tool — Event planen & SpotInfo"
          headerExtra={<AppHeader />}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route
              path="/events/:eventUuid"
              element={
                <RequireAuth>
                  <EventWorkspacePage />
                </RequireAuth>
              }
            />
          </Routes>
        </AppShell>
      </ToastProvider>
    </AuthProvider>
  );
}
