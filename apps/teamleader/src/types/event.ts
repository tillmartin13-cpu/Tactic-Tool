import type { KMResult } from '@sg/gpx';

/** User-facing workflow — SpotInfo becomes a phase inside full planning */
export type EventPhase = 'planning' | 'spotinfo';

export type EventIntent = 'full' | 'spotinfo_focus';

export interface DbEvent {
  id: string;
  event_id: string;
  name: string | null;
  date: string | null;
  type: string | null;
  prev_event_id: string | null;
  created_at: string;
}

export interface DbTrack {
  id: string;
  event_id: string;
  name: string;
  color: string;
  geojson: {
    points: { lat: number; lng: number; ele?: number }[];
    cumKm: number[];
    totalKm: number;
    hasEle: boolean;
  };
}

export interface DbSpot {
  id: string;
  event_id: string;
  lat: number;
  lng: number;
  km_results: { name: string; km: number; dist: number }[] | null;
  comment: string | null;
  sort_order: number;
}

export interface WorkspaceSpot {
  id: string;
  kuerzel: string;
  lat: number;
  lng: number;
  kmResults: KMResult[];
}

export interface EventWorkspaceState {
  event: DbEvent;
  intent: EventIntent;
  phase: EventPhase;
  tracks: import('@sg/gpx').Track[];
  spots: WorkspaceSpot[];
}
