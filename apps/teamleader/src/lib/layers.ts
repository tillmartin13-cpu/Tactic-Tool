import { supabase } from './supabase';

export interface EventLayer {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  sort_order: number;
}

export async function listEventLayers(eventId: string): Promise<EventLayer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('event_layers')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function createEventLayer(
  eventId: string,
  name: string,
  lat?: number,
  lng?: number,
): Promise<EventLayer> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('event_layers')
    .insert({ event_id: eventId, name, lat: lat ?? null, lng: lng ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEventLayer(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('event_layers').delete().eq('id', id);
}
