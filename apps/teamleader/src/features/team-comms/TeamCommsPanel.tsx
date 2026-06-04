import { canSendTeamBroadcast } from '@sg/auth';
import type { UserRole } from '@sg/auth';
import { Button } from '@sg/ui';

interface TeamCommsPanelProps {
  /** Current user role — until auth is wired, pass null to show disabled state. */
  role?: UserRole | null;
}

/**
 * Stub for „Team informieren“ — see docs/features/team-communications.md
 */
export function TeamCommsPanel({ role = null }: TeamCommsPanelProps) {
  const allowed = role != null && canSendTeamBroadcast(role);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Team informieren</h2>
      <p className="mt-2 text-sm text-slate-600">
        E-Mail an das Event-Team (Resend). <strong>Eine WhatsApp-Gruppe pro Event:</strong>{' '}
        in WhatsApp anlegen, Einladungslink hier einfügen — keine Telefonnummern im Tool nötig.
      </p>

      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>WhatsApp-Gruppe erstellen (App oder später: Kurz-Hilfe im Tool)</li>
        <li>Einladungslink speichern (ein Feld pro Event)</li>
        <li>Optional: gleicher Link in der Team-E-Mail</li>
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!allowed} title={allowed ? undefined : 'Nach Anmeldung verfügbar'}>
          E-Mail ans Team senden (bald)
        </Button>
        <Button variant="secondary" disabled>
          WhatsApp-Link speichern (bald)
        </Button>
      </div>

      {!allowed && (
        <p className="mt-2 text-xs text-slate-500">
          Verfügbar für Teamleiter, Office und Admin nach Login.
        </p>
      )}
    </section>
  );
}
