import { Button } from '@sg/ui';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { formatAuthError } from '../lib/authErrors';

export function SignUpPage() {
  const { signUp, session, canUseTeamleaderApp, canUsePhotographerApp, loading, bypassAuth } =
    useAuth();
  const [name, setName] = useState('');
  const [kuerzel, setKuerzel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session && (canUseTeamleaderApp || canUsePhotographerApp || bypassAuth)) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signUp({
        email,
        password,
        name,
        kuerzel: kuerzel || undefined,
      });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <h1 className="text-xl font-semibold text-navy">Konto erstellen</h1>
      <p className="text-sm text-slate-600">
        Für Sportograf-Fotografen und Teamleiter. Teamleiter-Rechte pro Event erhältst du, wenn du
        einem Event als TL zugewiesen wirst — nicht automatisch bei der Registrierung.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Name *</label>
          <input
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Kürzel (optional)</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold uppercase"
            value={kuerzel}
            onChange={(e) => setKuerzel(e.target.value.toUpperCase())}
            placeholder="MK"
            maxLength={12}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">E-Mail *</label>
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
          <label className="text-sm font-medium text-slate-700">Passwort *</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">Mindestens 8 Zeichen</p>
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? '…' : 'Registrieren'}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Bereits ein Konto?{' '}
        <Link to="/login" className="font-semibold text-navy underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
