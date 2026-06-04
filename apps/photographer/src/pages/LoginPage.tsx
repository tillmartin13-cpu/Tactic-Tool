import { Button } from '@sg/ui';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { formatAuthError } from '../lib/authErrors';

const tlAppUrl = import.meta.env.VITE_TL_APP_URL as string | undefined;

export function LoginPage() {
  const { signIn, session, canUsePhotographerApp, loading, bypassAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session && (canUsePhotographerApp || bypassAuth)) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-page py-6">
      <h1 className="text-xl font-semibold text-navy">Tactic Tool — Fotograf</h1>
      <form onSubmit={handleSubmit} className="photo-card space-y-4">
        <input
          type="email"
          required
          placeholder="E-Mail"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Passwort"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-base text-brand-red">{error}</p>}
        <Button type="submit" size="touch" className="w-full" disabled={busy}>
          Anmelden
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link to="/signup" className="text-navy underline">
          Registrieren
        </Link>
        {tlAppUrl ? (
          <>
            {' · '}
            <a href={tlAppUrl} className="text-navy underline">
              Teamleiter-App
            </a>
          </>
        ) : null}
      </p>
    </div>
  );
}
