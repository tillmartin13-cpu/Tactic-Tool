import type { UserEventMembership } from '@sg/auth';
import { supabase } from './supabase';

export async function loadUserEventMembership(userId: string): Promise<UserEventMembership> {
  if (!supabase) {
    return { teamleaderEventIds: [], officeEventIds: [], photographerEventIds: [] };
  }

  const [tl, office, spots] = await Promise.all([
    supabase.from('event_teamleaders').select('event_id').eq('user_id', userId),
    supabase.from('event_office').select('event_id').eq('user_id', userId),
    supabase.from('spot_assignments').select('spots(event_id)').eq('photographer_id', userId),
  ]);

  if (tl.error) throw tl.error;
  if (office.error) throw office.error;
  if (spots.error) throw spots.error;

  const teamleaderIds = new Set(tl.data?.map((r) => r.event_id) ?? []);

  const { data: created } = await supabase
    .from('events')
    .select('id')
    .eq('created_by', userId);
  for (const row of created ?? []) {
    teamleaderIds.add(row.id);
  }

  const photographerIds = new Set<string>();
  for (const row of spots.data ?? []) {
    const spot = row.spots as unknown as { event_id: string } | { event_id: string }[];
    const evId = Array.isArray(spot) ? spot[0]?.event_id : spot?.event_id;
    if (evId) photographerIds.add(evId);
  }

  const { data: pool } = await supabase
    .from('event_photographers')
    .select('event_id')
    .eq('photographer_id', userId);
  for (const row of pool ?? []) {
    photographerIds.add(row.event_id);
  }

  return {
    teamleaderEventIds: [...teamleaderIds],
    officeEventIds: (office.data ?? []).map((r) => r.event_id),
    photographerEventIds: [...photographerIds],
  };
}
