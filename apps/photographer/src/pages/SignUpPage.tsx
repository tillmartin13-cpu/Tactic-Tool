import { Button } from '@sg/ui';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { formatAuthError } from '../lib/authErrors';

export function SignUpPage() {
  const { signUp, session, canUsePhotographerApp, loading, bypassAuth } = useAuth();
  const [name, setName] = useState('');
  const [kuerzel, setKuerzel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session && (canUsePhotographerApp || bypassAuth)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="photo-page py-6">
      <h1 className="text-xl font-semibold text-navy">Konto erstellen</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void signUp({ email, password, name, kuerzel })
            .catch((err) => setError(formatAuthError(err)))
            .finally(() => setBusy(false));
        }}
        className="photo-card space-y-3"
      >
        <input
          required
          placeholder="Name"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Kürzel"
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base uppercase"
          value={kuerzel}
          onChange={(e) => setKuerzel(e.target.value.toUpperCase())}
        />
        <input
          type="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-base text-brand-red">{error}</p>}
        <Button type="submit" size="touch" className="w-full" disabled={busy}>
          Registrieren
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link to="/login" className="text-navy underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
