import { Button } from '@sg/ui';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { formatAuthError } from '../lib/authErrors';

const photoAppUrl = import.meta.env.VITE_PHOTO_APP_URL as string | undefined;

export function LoginPage() {
  const {
    signIn,
    resetPassword,
    session,
    canUseTeamleaderApp,
    canUsePhotographerApp,
    loading,
    bypassAuth,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session) {
    if (canUseTeamleaderApp || bypassAuth) return <Navigate to="/" replace />;
    if (canUsePhotographerApp && photoAppUrl) {
      window.location.href = photoAppUrl;
      return <p className="text-slate-500">Weiterleitung…</p>;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    const mail = email.trim();
    if (!mail) {
      setError('Bitte zuerst deine E-Mail eintragen.');
      return;
    }
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await resetPassword(mail);
      setInfo('Falls ein Konto existiert, wurde ein Reset-Link an deine E-Mail gesendet.');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <h1 className="text-xl font-semibold text-navy">Tactic Tool — Anmelden</h1>
      <p className="text-sm text-slate-600">
        Planung & SpotInfo für Teamleiter. Nur Fotograf an Events? Nutze die{' '}
        {photoAppUrl ? (
          <a href={photoAppUrl} className="font-semibold text-navy underline">
            Fotografen-App
          </a>
        ) : (
          'Fotografen-App'
        )}
        .
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">E-Mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Passwort</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        {info && <p className="text-sm text-green-800">{info}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? '…' : 'Anmelden'}
        </Button>
        <button
          type="button"
          className="w-full text-center text-xs text-navy underline"
          disabled={busy}
          onClick={() => void handleReset()}
        >
          Passwort vergessen?
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Noch kein Konto?{' '}
        <Link to="/signup" className="font-semibold text-navy underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
