# User roles

| Role | Who | App | Event access |
|------|-----|-----|----------------|
| `admin` | Sportograf admins | Teamleader | All events |
| `teamleader` | Freelance TLs | Teamleader | Events in `event_teamleaders` |
| `office` | Internal Sportograf staff | Teamleader | Events in `event_office` |
| `photographer` | Freelance photographers | Photographer | Spots via `spot_assignments` |

Office users share the **Teamleader** frontend with TLs. After login, `profiles.role === 'office'` gets read-oriented UI (map, spots, KM, comments, assignments) without destructive actions unless we extend permissions later.

## Permissions (target)

| Action | admin | teamleader | office | photographer |
|--------|:-----:|:----------:|:------:|:------------:|
| Create / delete event | ✓ | ✓ | — | — |
| Assign office to event | ✓ | ✓ | — | — |
| Upload GPX / delete track | ✓ | ✓ | — | — |
| Create / move / delete spot | ✓ | ✓ | — | — |
| View map, spots, KM | ✓ | ✓ | ✓ | own spot |
| Assign photographer to spot | ✓ | ✓ | — | — |
| Upload tactic PDF | ✓ | ✓ | — | download |
| Review camera checks | ✓ | ✓ | view (optional) | own |
| Spot report (post-event) | ✓ | ✓ | ✓ | submit own |
| Send team email („Team informieren“) | ✓ | ✓ | ✓ | — |
| Set WhatsApp group invite link on event | ✓ | ✓ | — | — |
| Fahrgemeinschaften (Autos, Kürzel zuordnen) | ✓ | ✓ | view | — |
| Vorjahres-Archiv anzeigen / importieren | ✓ | ✓ | view / import TBD | — |

Assign office staff per event: insert into `event_office` (same pattern as `event_teamleaders`).

## Auth redirect (planned)

```
login → load profiles.role
  teamleader | admin | office  →  VITE_TL_APP_URL (apps/teamleader)
  photographer                 →  VITE_PHOTO_APP_URL (apps/photographer)
```

Implemented in `@sg/auth`: `usesTeamleaderApp()`, `usesPhotographerApp()`, `canManageEvents()`, `canEditSpots()`.
