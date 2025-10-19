export interface ZoneData {
  zone: string;
  title: string;
  color: string;
}

export interface ZipLookupResult {
  lat: number;
  lon: number;
  displayName: string;
  zone?: string;
}