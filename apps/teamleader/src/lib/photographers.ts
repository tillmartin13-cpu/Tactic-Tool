import type { PhotographerProfile, SpotAssignmentRow, WorkspaceSpot } from '../types/event';
import { supabase } from './supabase';

export const PHOTOGRAPHER_DRAG_TYPE = 'application/x-sg-photographer-id';

export async function listAllPhotographers(): Promise<PhotographerProfile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, kuerzel')
    .eq('role', 'photographer')
    .order('name');
  if (error) throw error;
  return (data ?? []) as PhotographerProfile[];
}

export async function listEventPhotographers(eventId: string): Promise<PhotographerProfile[]> {
  if (!supabase) return [];
  const { data: links, error: e0 } = await supabase
    .from('event_photographers')
    .select('photographer_id')
    .eq('event_id', eventId);
  if (e0) throw e0;
  const ids = (links ?? []).map((l) => l.photographer_id);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, kuerzel')
    .in('id', ids)
    .order('name');
  if (error) throw error;
  return (data ?? []) as PhotographerProfile[];
}

export async function addEventPhotographer(
  eventId: string,
  photographerId: string,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('event_photographers')
    .upsert({ event_id: eventId, photographer_id: photographerId });
  if (error) throw error;
}

export async function removeEventPhotographer(
  eventId: string,
  photographerId: string,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('event_photographers')
    .delete()
    .eq('event_id', eventId)
    .eq('photographer_id', photographerId);
  if (error) throw error;
}

export async function loadSpotAssignmentsForEvent(
  eventId: string,
): Promise<SpotAssignmentRow[]> {
  if (!supabase) return [];
  const { data: spotRows, error: e0 } = await supabase
    .from('spots')
    .select('id')
    .eq('event_id', eventId);
  if (e0) throw e0;
  return loadAssignmentsBySpotIds((spotRows ?? []).map((s) => s.id));
}

export async function assignPhotographerToSpot(
  spotId: string,
  photographerId: string,
): Promise<SpotAssignmentRow> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: existing } = await supabase
    .from('spot_assignments')
    .select('id')
    .eq('spot_id', spotId)
    .eq('photographer_id', photographerId)
    .maybeSingle();

  if (existing?.id) {
    const rows = await loadAssignmentsBySpotIds([spotId]);
    const found = rows.find((r) => r.id === existing.id);
    if (found) return found;
  }

  const { data, error } = await supabase
    .from('spot_assignments')
    .insert({ spot_id: spotId, photographer_id: photographerId })
    .select('id, spot_id, photographer_id')
    .single();
  if (error) throw error;

  const { data: profile, error: e1 } = await supabase
    .from('profiles')
    .select('id, name, kuerzel')
    .eq('id', photographerId)
    .single();
  if (e1) throw e1;

  return {
    id: data.id,
    spotId: data.spot_id,
    photographerId: data.photographer_id,
    photographer: profile as PhotographerProfile,
  };
}

export async function unassignPhotographerFromSpot(assignmentId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('spot_assignments').delete().eq('id', assignmentId);
  if (error) throw error;
}

async function loadAssignmentsBySpotIds(spotIds: string[]): Promise<SpotAssignmentRow[]> {
  if (!supabase || !spotIds.length) return [];

  const { data: assigns, error } = await supabase
    .from('spot_assignments')
    .select('id, spot_id, photographer_id')
    .in('spot_id', spotIds);
  if (error) throw error;
  if (!assigns?.length) return [];

  const photogIds = [...new Set(assigns.map((a) => a.photographer_id))];
  const { data: profiles, error: e1 } = await supabase
    .from('profiles')
    .select('id, name, kuerzel')
    .in('id', photogIds);
  if (e1) throw e1;

  const byId = new Map((profiles ?? []).map((p) => [p.id, p as PhotographerProfile]));

  return assigns.map((a) => ({
    id: a.id,
    spotId: a.spot_id,
    photographerId: a.photographer_id,
    photographer: byId.get(a.photographer_id) ?? {
      id: a.photographer_id,
      name: '?',
      kuerzel: null,
    },
  }));
}

export function spotPinLabel(spot: WorkspaceSpot): string {
  const tags = spot.assignments
    .map((a) => a.kuerzel?.trim())
    .filter((k): k is string => !!k);
  if (tags.length) return tags.join(' · ');
  return spot.kuerzel;
}

export function attachAssignmentsToSpots(
  spots: WorkspaceSpot[],
  assignments: SpotAssignmentRow[],
): WorkspaceSpot[] {
  return spots.map((s) => {
    const mine = assignments.filter((a) => a.spotId === s.id);
    return {
      ...s,
      assignments: mine.map((a) => ({
        assignmentId: a.id,
        photographerId: a.photographerId,
        name: a.photographer.name,
        kuerzel: a.photographer.kuerzel,
      })),
    };
  });
}

export function photographerDisplayKuerzel(p: PhotographerProfile): string {
  return p.kuerzel?.trim() || p.name.split(' ')[0]?.slice(0, 3).toUpperCase() || '?';
}
