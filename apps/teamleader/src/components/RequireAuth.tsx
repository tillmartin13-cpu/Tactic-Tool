import { roleLabel } from '@sg/auth';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const photoAppUrl = import.meta.env.VITE_PHOTO_APP_URL as string | undefined;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, profile, bypassAuth, canUseTeamleaderApp, canUsePhotographerApp } =
    useAuth();
  const loc = useLocation();

  if (loading) {
    return <p className="text-slate-500">Laden…</p>;
  }

  if (bypassAuth) return <>{children}</>;

  if (!session) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  if (!canUseTeamleaderApp) {
    if (canUsePhotographerApp && photoAppUrl) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm">
          <p className="text-slate-700">
            Für dieses Event bist du als <strong>Fotograf</strong> eingeplant, nicht als Teamleiter.
          </p>
          <a href={photoAppUrl} className="mt-3 inline-block font-semibold text-navy underline">
            Zur Fotografen-App →
          </a>
        </div>
      );
    }
    return (
      <p className="text-brand-red">
        Kein Zugriff auf die Planungs-App
        {profile?.role ? ` (Profil: ${roleLabel(profile.role)})` : ''}. Du brauchst eine Zuweisung
        als Teamleiter für mindestens ein Event, oder die Rolle Admin/Office.
      </p>
    );
  }

  return <>{children}</>;
}
