import { Button } from '@sg/ui';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { canAccessTeamleaderApp, useAuth } from '../lib/auth';

export function LoginPage() {
  const { signIn, session, profile, bypassAuth, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session && canAccessTeamleaderApp(profile, bypassAuth)) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fehlgeschlagen');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <h1 className="text-xl font-semibold text-navy">Tactic Tool — Anmelden</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">E-Mail</label>
          <input
            type="email"
            required
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
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? '…' : 'Anmelden'}
        </Button>
      </form>
    </div>
  );
}
