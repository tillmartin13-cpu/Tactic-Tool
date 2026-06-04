# Supabase — Eventplaner (Tactic Tool)

## SQL (einmalig)

1. [SQL Editor](https://supabase.com/dashboard/project/kzeieqcxzyynfukgmbqv/sql/new) öffnen  
2. Gesamte Datei **`supabase/RUN_IN_SQL_EDITOR.sql`** kopieren → einfügen → **Run**  
3. Erfolg: keine roten Fehler (grün / „Success“)
4. **`supabase/migrations/20260604600000_dev_rls.sql`** ausführen (RLS für Entwicklung)
5. Im Projektordner: `npm run import:catalog` (1593 Archiv-Einträge)

Falls Tabellen schon existieren: nur auf leerem Projekt ausführen, oder Fehler „already exists“ ignorieren und nicht erneut komplett laufen lassen.

## Lokale Keys

Root-`.env`:

```env
VITE_SUPABASE_URL=https://kzeieqcxzyynfukgmbqv.supabase.co
VITE_SUPABASE_ANON_KEY=…
```

## Auth

1. Dashboard → **Authentication** → Email aktivieren.
2. Rollen & Admin: siehe **[auth-setup.md](./auth-setup.md)** (`till@sportograf.com` → Admin).
3. SQL: `20260604800000_auth_profiles_trigger.sql` und `20260604900000_roles_and_admin_till.sql`.
