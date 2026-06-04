import type { UserEventMembership } from '@sg/auth';
import { supabase } from './supabase';

export interface PhotoEventCard {
  id: string;
  event_id: string;
  name: string | null;
  date: string | null;
  type: string | null;
}

export interface MySpotView {
  spotId: string;
  kuerzel: string;
  lat: number;
  lng: number;
  comment: string | null;
  layer: string | null;
  kmResults: { trackName: string; km: number }[];
}

export async function listPhotographerEvents(
  membership: UserEventMembership,
): Promise<PhotoEventCard[]> {
  if (!supabase || !membership.photographerEventIds.length) return [];
  const { data, error } = await supabase
    .from('events')
    .select('id, event_id, name, date, type')
    .in('id', membership.photographerEventIds)
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function loadMySpots(eventUuid: string, userId: string): Promise<MySpotView[]> {
  if (!supabase) return [];

  const { data: assigns, error: e0 } = await supabase
    .from('spot_assignments')
    .select('spot_id')
    .eq('photographer_id', userId);
  if (e0) throw e0;
  const spotIds = (assigns ?? []).map((a) => a.spot_id);
  if (!spotIds.length) return [];

  const { data: spots, error } = await supabase
    .from('spots')
    .select('*')
    .eq('event_id', eventUuid)
    .in('id', spotIds);
  if (error) throw error;

  return (spots ?? []).map((s) => ({
    spotId: s.id,
    kuerzel: s.kuerzel ?? 'SPOT',
    lat: s.lat,
    lng: s.lng,
    comment: s.comment,
    layer: s.layer,
    kmResults: (s.km_results as { name: string; km: number }[] | null) ?? [],
  }));
}

export async function loadTacticPdf(eventUuid: string): Promise<{ name: string; url: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('tactic_pdfs')
    .select('name, storage_path')
    .eq('event_id', eventUuid)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const { data: urlData } = supabase.storage
    .from('tactic_pdfs')
    .getPublicUrl(data.storage_path);
  return { name: data.name ?? 'Taktik-PDF', url: urlData.publicUrl };
}
