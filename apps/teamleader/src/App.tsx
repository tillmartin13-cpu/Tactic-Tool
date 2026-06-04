import { roleLabel } from '@sg/auth';
import { AppShell, ToastProvider } from '@sg/ui';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider, useAuth } from './lib/auth';
import { EventWorkspacePage } from './pages/EventWorkspacePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

const photoAppUrl = import.meta.env.VITE_PHOTO_APP_URL as string | undefined;

function AppHeader() {
  const { session, profile, signOut, bypassAuth, canUsePhotographerApp } = useAuth();
  if (bypassAuth || !session) return null;
  return (
    <div className="flex flex-col items-end gap-1 text-xs text-white/90">
      <button type="button" onClick={() => void signOut()} className="underline hover:text-white">
        {profile ? `${profile.name} (${roleLabel(profile.role)})` : 'Abmelden'}
      </button>
      {canUsePhotographerApp && photoAppUrl ? (
        <a href={photoAppUrl} className="underline hover:text-white">
          Fotografen-App →
        </a>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell
          layout="planning"
          title="Teamleader"
          subtitle="Tactic Tool — Event planen & SpotInfo"
          headerExtra={<AppHeader />}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
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
