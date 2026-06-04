export interface ArchiveSpot {
  id: string;
  lat: number;
  lng: number;
  photographerKuerzel?: string;
  shootStart?: string;
  shootEnd?: string;
  photoCount?: number;
  km?: number;
  comment?: string;
}

export interface ArchiveSpotHint {
  spot: ArchiveSpot;
  distanceM: number;
  seasonYear?: number;
}
