import { Navigate, useLocation } from 'react-router-dom';
import { canAccessTeamleaderApp, useAuth } from '../lib/auth';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, profile, bypassAuth } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <p className="text-slate-500">Laden…</p>;
  }

  if (bypassAuth) return <>{children}</>;

  if (!session) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  if (!canAccessTeamleaderApp(profile, false)) {
    return (
      <p className="text-brand-red">
        Kein Zugriff (Rolle: {profile?.role ?? 'unbekannt'}). Nur Teamleader/Admin/Office.
      </p>
    );
  }

  return <>{children}</>;
}
