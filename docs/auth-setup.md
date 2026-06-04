# Auth & Rollen

## Rollen (4)

| DB-Wert (`profiles.role`) | Anzeige | App |
|---------------------------|---------|-----|
| `admin` | **Admin** | Teamleader |
| `teamleader` | **Team Leader** | Teamleader |
| `office` | **Office** | Teamleader |
| `photographer` | **Photographer** | Photographer |

## Admin: till@sportograf.com

1. **Supabase Dashboard** → Authentication → Users → **Add user**
   - Email: `till@sportograf.com`
   - Passwort setzen (oder Magic Link)
   - „Auto Confirm User“ aktivieren

2. **SQL Editor** — Migration ausführen:
   - `supabase/migrations/20260604800000_auth_profiles_trigger.sql` (falls noch nicht)
   - `supabase/migrations/20260604900000_roles_and_admin_till.sql`

3. Neu registrierte User mit dieser E-Mail erhalten automatisch `role = admin` (Trigger).

4. **Teamleader-App** → `/login` mit E-Mail + Passwort.

## Weitere User

| Rolle | Anlegen |
|-------|---------|
| Team Leader | User in Auth + `profiles.role = 'teamleader'` |
| Office | `profiles.role = 'office'` + Zeile in `event_office` |
| Photographer | `profiles.role = 'photographer'` + `spot_assignments` |

Beim manuellen Anlegen ohne Trigger:

```sql
-- Beispiel nach Auth-User-Erstellung
update public.profiles
set role = 'teamleader', name = 'Max Mustermann', kuerzel = 'MM'
where id = '<uuid aus auth.users>';
```

## Vercel

Env wie bisher: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (nur Anon-Key, kein Service Role im Frontend).
