/** User-facing auth messages (Supabase returns English codes). */
export function formatAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Invalid login credentials')) {
    return 'E-Mail oder Passwort falsch — oder der Account wurde in Supabase noch nicht angelegt.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'E-Mail noch nicht bestätigt. In Supabase den User „Auto Confirm“ setzen oder Link in der Mail öffnen.';
  }
  return msg;
}
