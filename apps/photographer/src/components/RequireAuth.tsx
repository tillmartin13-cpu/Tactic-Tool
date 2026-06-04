import { roleLabel } from '@sg/auth';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const tlAppUrl = import.meta.env.VITE_TL_APP_URL as string | undefined;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, profile, bypassAuth, canUsePhotographerApp, canUseTeamleaderApp } =
    useAuth();
  const loc = useLocation();

  if (loading) return <p className="text-slate-500">Laden…</p>;
  if (bypassAuth) return <>{children}</>;
  if (!session) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;

  if (!canUsePhotographerApp) {
    if (canUseTeamleaderApp) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm">
          <p>Du bist für dieses Tool als Teamleiter eingeplant.</p>
          {tlAppUrl ? (
            <a href={tlAppUrl} className="mt-2 inline-block font-semibold text-navy underline">
              Zur Planungs-App →
            </a>
          ) : (
            <Link to="/login" className="mt-2 inline-block text-navy underline">
              Login
            </Link>
          )}
        </div>
      );
    }
    return (
      <p className="text-brand-red">
        Kein Fotografen-Zugang{profile?.role ? ` (${roleLabel(profile.role)})` : ''}. Du musst einem
        Event mit Spot zugewiesen sein.
      </p>
    );
  }

  return <>{children}</>;
}
