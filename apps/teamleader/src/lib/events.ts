import {
  geojsonToTrack,
  parseGPX,
  trackColor,
  trackToGeojson,
  type Track,
} from '@sg/gpx';
import type { UserEventMembership, UserRole } from '@sg/auth';
import type { DbEvent, DbSpot, DbTrack, EventIntent, WorkspaceSpot } from '../types/event';
import { supabase } from './supabase';

function kmFromDb(
  raw: { name: string; km: number; dist: number }[] | null,
  tracks: Track[],
): WorkspaceSpot['kmResults'] {
  if (!raw?.length) return [];
  return raw.map((r) => {
    const t = tracks.find((x) => x.name === r.name);
    return {
      trackId: t?.id ?? '',
      trackName: r.name,
      km: r.km,
      dist: r.dist,
    };
  });
}

export async function listEvents(): Promise<DbEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Events visible in the Teamleader app for this user (event-scoped, not global role only). */
export async function listEventsForUser(
  userId: string,
  globalRole: UserRole,
  membership: UserEventMembership,
): Promise<DbEvent[]> {
  if (!supabase) return [];
  if (globalRole === 'admin') return listEvents();

  const ids = new Set([
    ...membership.teamleaderEventIds,
    ...membership.officeEventIds,
  ]);
  if (!ids.size) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', [...ids])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(
  input: {
    eventId: string;
    name?: string;
    date?: string;
    type?: string;
    prevEventId?: string;
    intent: EventIntent;
  },
  createdByUserId?: string,
): Promise<DbEvent> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('events')
    .insert({
      event_id: input.eventId.trim(),
      name: input.name?.trim() || null,
      date: input.date || null,
      type: input.type || null,
      prev_event_id: input.prevEventId?.trim() || null,
      created_by: createdByUserId ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  if (createdByUserId) {
    await supabase.from('event_teamleaders').upsert({
      event_id: data.id,
      user_id: createdByUserId,
    });
  }

  return data;
}

export async function loadEventWorkspace(eventUuid: string): Promise<{
  event: DbEvent;
  tracks: Track[];
  spots: WorkspaceSpot[];
}> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: event, error: e0 } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventUuid)
    .single();
  if (e0) throw e0;

  const { data: trackRows, error: e1 } = await supabase
    .from('tracks')
    .select('*')
    .eq('event_id', eventUuid);
  if (e1) throw e1;

  const tracks = (trackRows as DbTrack[]).map((row, i) =>
    geojsonToTrack(row.id, row.name, row.color || trackColor(i), row.geojson),
  );

  const { data: spotRows, error: e2 } = await supabase
    .from('spots')
    .select('*')
    .eq('event_id', eventUuid)
    .order('sort_order');
  if (e2) throw e2;

  const spots: WorkspaceSpot[] = (spotRows as DbSpot[]).map((s, idx) => {
    const row = s as DbSpot & { kuerzel?: string | null };
    let kuerzel = row.kuerzel?.trim();
    if (!kuerzel && s.comment?.startsWith('kuerzel:')) {
      kuerzel = s.comment.replace(/^kuerzel:/, '').trim();
    }
    return {
      id: s.id,
      kuerzel: kuerzel || `S${idx + 1}`,
      lat: s.lat,
      lng: s.lng,
      kmResults: kmFromDb(s.km_results, tracks),
      assignments: [],
    };
  });

  return { event, tracks, spots };
}

export async function uploadTrack(
  eventUuid: string,
  file: File,
  index: number,
): Promise<Track> {
  const text = await file.text();
  const parsed = parseGPX(text, file.name);
  parsed.color = trackColor(index);

  if (!supabase) return parsed;

  const { data, error } = await supabase
    .from('tracks')
    .insert({
      event_id: eventUuid,
      name: parsed.name,
      color: parsed.color,
      geojson: trackToGeojson(parsed),
    })
    .select()
    .single();
  if (error) throw error;

  return geojsonToTrack(data.id, data.name, data.color, data.geojson);
}

export async function deleteTrackDb(trackId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) throw error;
}

export async function saveSpot(
  eventUuid: string,
  spot: { kuerzel: string; lat: number; lng: number; kmResults: WorkspaceSpot['kmResults'] },
  existingId?: string,
): Promise<WorkspaceSpot> {
  const km_results = spot.kmResults.map((r) => ({
    name: r.trackName,
    km: r.km,
    dist: r.dist,
  }));

  const row: Record<string, unknown> = {
    event_id: eventUuid,
    lat: spot.lat,
    lng: spot.lng,
    km_results,
    kuerzel: spot.kuerzel,
    comment: null,
  };

  if (!supabase) {
    return {
      id: existingId ?? crypto.randomUUID(),
      kuerzel: spot.kuerzel,
      lat: spot.lat,
      lng: spot.lng,
      kmResults: spot.kmResults,
      assignments: [],
    };
  }

  if (existingId) {
    const { data, error } = await supabase
      .from('spots')
      .update(row)
      .eq('id', existingId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      kuerzel: spot.kuerzel,
      lat: data.lat,
      lng: data.lng,
      kmResults: spot.kmResults,
      assignments: [],
    };
  }

  const { count } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventUuid);

  const { data, error } = await supabase
    .from('spots')
    .insert({ ...row, sort_order: count ?? 0 })
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id,
    kuerzel: spot.kuerzel,
    lat: data.lat,
    lng: data.lng,
    kmResults: spot.kmResults,
    assignments: [],
  };
}

export async function deleteEvent(eventUuid: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('events').delete().eq('id', eventUuid);
  if (error) throw error;
}

export async function deleteSpotDb(spotId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('spots').delete().eq('id', spotId);
  if (error) throw error;
}

export async function listCatalogYears(): Promise<number[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('infofile_catalog')
    .select('archive_year')
    .order('archive_year', { ascending: false });
  if (error) throw error;
  const years = new Set((data ?? []).map((r) => r.archive_year as number));
  return [...years];
}
