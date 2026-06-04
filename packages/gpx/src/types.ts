export interface TrackPoint {
  lat: number;
  lng: number;
  ele?: number;
}

export interface Track {
  id: string;
  name: string;
  color?: string;
  points: TrackPoint[];
  cumKm: number[];
  totalKm: number;
  hasEle: boolean;
}

export type AmbiguousKmOption = KMResult;

export interface KMResult {
  trackId: string;
  trackName: string;
  km: number;
  dist: number;
}

export interface CoordExtraction {
  lat: number;
  lng: number;
  src: string;
}

export interface KMLSpot {
  name: string;
  lat: number;
  lng: number;
}
