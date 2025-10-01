export interface Location {
  id: string;
  name: string;
  country: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isPopular?: boolean;
  population?: number;
  timezone?: string;
}

export interface LocationSearchParams {
  query: string;
  country?: string;
  limit?: number;
  includeCoordinates?: boolean;
}

export interface LocationSearchResult {
  locations: Location[];
  total: number;
  hasMore: boolean;
}

export interface LocationServiceConfig {
  apiKey?: string;
  baseUrl: string;
  cacheTimeout: number; // in milliseconds
  maxCacheSize: number;
  fallbackToStatic: boolean;
}

export interface LocationCache {
  [key: string]: {
    data: Location[];
    timestamp: number;
    expiresAt: number;
  };
}

export type LocationInputMode = 'search' | 'select' | 'both';
export type LocationDisplayFormat = 'name' | 'name-state' | 'name-state-country' | 'full';

export interface LocationInputProps {
  value?: string;
  onChange: (location: Location | string) => void;
  placeholder?: string;
  mode?: LocationInputMode;
  displayFormat?: LocationDisplayFormat;
  country?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showCoordinates?: boolean;
  allowCustomInput?: boolean;
}
