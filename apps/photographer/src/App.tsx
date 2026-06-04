import { AppShell, ToastProvider } from '@sg/ui';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { RequireAuth } from './components/RequireAuth';
import { HomePage } from './pages/HomePage';
import { EventPage } from './pages/EventPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

function Header() {
  const { session, profile, signOut, bypassAuth } = useAuth();
  if (!session && !bypassAuth) return null;
  return (
    <button type="button" onClick={() => void signOut()} className="text-xs text-white/90 underline">
      {profile?.name ?? 'Abmelden'}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell
          layout="field"
          title="Fotograf"
          subtitle="Deine Spots & SpotInfo"
          headerExtra={<Header />}
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
                  <EventPage />
                </RequireAuth>
              }
            />
          </Routes>
        </AppShell>
      </ToastProvider>
    </AuthProvider>
  );
}
