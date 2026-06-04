import { buildKmResults, snapToTrack, type Track } from '@sg/gpx';
import { geojsonToTrack, trackColor } from '@sg/gpx';
import { supabase } from './supabase';

export async function loadEventTracks(eventUuid: string): Promise<Track[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('tracks').select('*').eq('event_id', eventUuid);
  if (error) throw error;
  return (data ?? []).map((row, i) =>
    geojsonToTrack(row.id, row.name, row.color || trackColor(i), row.geojson),
  );
}

export async function submitSpotReport(
  eventUuid: string,
  userId: string,
  lat: number,
  lng: number,
  tracks: Track[],
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const snapped = tracks.length ? snapToTrack(lat, lng, tracks) : { lat, lng };
  const km = tracks.length ? buildKmResults(snapped.lat, snapped.lng, tracks) : [];
  const km_results = km.map((r) => ({ name: r.trackName, km: r.km, dist: r.dist }));

  const { error } = await supabase.from('spot_reports').insert({
    event_id: eventUuid,
    photographer_id: userId,
    lat: snapped.lat,
    lng: snapped.lng,
    km_results,
  });
  if (error) throw error;
}

export async function loadMyReport(eventUuid: string, userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('spot_reports')
    .select('*')
    .eq('event_id', eventUuid)
    .eq('photographer_id', userId)
    .order('reported_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
