import { canEditCarpools } from '@sg/auth';
import type { UserRole } from '@sg/auth';
import { Button } from '@sg/ui';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface VehicleRow {
  id: string;
  label: string;
  driver_name: string | null;
}

export function CarpoolPanel({
  eventUuid,
  role,
}: {
  eventUuid: string;
  role: UserRole | null;
}) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [label, setLabel] = useState('');
  const canEdit = role != null && canEditCarpools(role);

  const load = () => {
    if (!supabase) return;
    void supabase
      .from('event_vehicles')
      .select('id, label, driver_name')
      .eq('event_id', eventUuid)
      .then(({ data }) => setVehicles(data ?? []));
  };

  useEffect(() => {
    load();
  }, [eventUuid]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-navy">Fahrgemeinschaften</h3>
      <ul className="mt-2 space-y-1 text-xs">
        {vehicles.map((v) => (
          <li key={v.id}>
            {v.label}
            {v.driver_name ? ` · ${v.driver_name}` : ''}
          </li>
        ))}
        {!vehicles.length && <li className="text-slate-500">Noch keine Autos</li>}
      </ul>
      {canEdit && (
        <div className="mt-2 flex gap-1">
          <input
            className="flex-1 rounded border px-2 py-1 text-xs"
            placeholder="Auto 1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button
            variant="secondary"
            className="!text-xs"
            onClick={() => {
              if (!label.trim() || !supabase) return;
              void supabase
                .from('event_vehicles')
                .insert({ event_id: eventUuid, label: label.trim() })
                .then(load);
              setLabel('');
            }}
          >
            +
          </Button>
        </div>
      )}
    </section>
  );
}
