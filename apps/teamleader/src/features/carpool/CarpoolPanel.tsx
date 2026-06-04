import { canEditCarpools } from '@sg/auth';
import type { UserRole } from '@sg/auth';
import { Button } from '@sg/ui';

interface CarpoolPanelProps {
  role?: UserRole | null;
}

/**
 * Stub for Fahrgemeinschaften — see docs/features/carpool.md
 */
export function CarpoolPanel({ role = null }: CarpoolPanelProps) {
  const canEdit = role != null && canEditCarpools(role);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-navy">Fahrgemeinschaften</h2>
      <p className="mt-2 text-sm text-slate-600">
        Autos anlegen und Fotografen-Kürzel per Drag &amp; Drop zuordnen — für die
        Anreise-Logistik ohne extra Tabellen voller Adressdaten.
      </p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {['Auto 1', 'Auto 2'].map((label) => (
          <div
            key={label}
            className="min-w-[140px] flex-shrink-0 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-xs font-medium text-navy">{label}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
                MK
              </span>
            </div>
          </div>
        ))}
        <div className="flex min-w-[100px] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">
          + Auto
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Nicht zugeordnet: <span className="font-semibold text-brand-red">AB</span>,{' '}
        <span className="font-semibold text-brand-red">FS</span> (Vorschau)
      </p>

      <Button className="mt-4" disabled={!canEdit} variant={canEdit ? 'primary' : 'secondary'}>
        Fahrgemeinschaften bearbeiten (bald)
      </Button>
    </section>
  );
}
