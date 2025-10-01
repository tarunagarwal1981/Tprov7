import { Location, LocationDisplayFormat } from '../types/location';

/**
 * Format location display based on the specified format
 */
export function formatLocationDisplay(
  location: Location, 
  format: LocationDisplayFormat = 'name-state'
): string {
  switch (format) {
    case 'name':
      return location.name;
    
    case 'name-state':
      return location.state ? `${location.name}, ${location.state}` : location.name;
    
    case 'name-state-country':
      return location.state 
        ? `${location.name}, ${location.state}, ${location.country}`
        : `${location.name}, ${location.country}`;
    
    case 'full':
      return `${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`;
    
    default:
      return location.name;
  }
}

/**
 * Generate a unique cache key for location searches
 */
export function generateCacheKey(
  query: string, 
  country?: string, 
  limit?: number
): string {
  return `${query.toLowerCase().trim()}-${country || 'all'}-${limit || 10}`;
}

/**
 * Validate location data
 */
export function validateLocation(location: Partial<Location>): boolean {
  return !!(
    location.name && 
    location.country && 
    location.name.trim().length > 0
  );
}

/**
 * Sort locations by popularity and relevance
 */
export function sortLocations(locations: Location[], query?: string): Location[] {
  return locations.sort((a, b) => {
    // Prioritize popular locations
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    
    // Prioritize exact matches
    if (query) {
      const aExact = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bExact = b.name.toLowerCase().startsWith(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
    }
    
    // Sort by population (descending)
    if (a.population && b.population) {
      return b.population - a.population;
    }
    
    // Sort by name (ascending)
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter locations by country
 */
export function filterLocationsByCountry(
  locations: Location[], 
  country: string
): Location[] {
  return locations.filter(
    location => location.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Search locations using simple text matching
 */
export function searchLocations(
  locations: Location[], 
  query: string
): Location[] {
  if (!query || query.length < 2) {
    return locations;
  }

  const lowerQuery = query.toLowerCase();
  
  return locations.filter(location => 
    location.name.toLowerCase().includes(lowerQuery) ||
    location.state?.toLowerCase().includes(lowerQuery) ||
    location.country.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearby locations within a radius
 */
export function findNearbyLocations(
  locations: Location[], 
  centerLat: number, 
  centerLng: number, 
  radiusKm: number
): Location[] {
  return locations.filter(location => {
    if (!location.coordinates) return false;
    
    const distance = calculateDistance(
      centerLat, 
      centerLng, 
      location.coordinates.lat, 
      location.coordinates.lng
    );
    
    return distance <= radiusKm;
  });
}

/**
 * Convert location to string for form submission
 */
export function locationToString(location: Location): string {
  return location.name;
}

/**
 * Convert string to location object (for form compatibility)
 */
export function stringToLocation(
  locationString: string, 
  country: string = 'India'
): Location {
  return {
    id: `temp-${Date.now()}`,
    name: locationString,
    country,
    isPopular: false
  };
}

/**
 * Convert array of locations to string array
 */
export function locationsToStringArray(locations: Location[]): string[] {
  return locations.map(locationToString);
}

/**
 * Convert string array to location array
 */
export function stringArrayToLocations(
  strings: string[], 
  country: string = 'India'
): Location[] {
  return strings.map((str, index) => ({
    id: `temp-${index}`,
    name: str,
    country,
    isPopular: false
  }));
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a location is valid for selection
 */
export function isValidLocation(location: any): location is Location {
  return (
    location &&
    typeof location === 'object' &&
    typeof location.id === 'string' &&
    typeof location.name === 'string' &&
    typeof location.country === 'string'
  );
}

/**
 * Create a location object from API response
 */
export function createLocationFromApiData(data: any): Location {
  return {
    id: data.geonameId?.toString() || data.id || `temp-${Date.now()}`,
    name: data.name || '',
    country: data.countryName || data.country || '',
    state: data.adminName1 || data.state,
    coordinates: data.lat && data.lng ? {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lng)
    } : undefined,
    population: data.population ? parseInt(data.population) : undefined,
    isPopular: data.isPopular || false
  };
}

/**
 * Get location display text for different contexts
 */
export function getLocationDisplayText(
  location: Location, 
  context: 'short' | 'medium' | 'long' = 'medium'
): string {
  switch (context) {
    case 'short':
      return location.name;
    
    case 'medium':
      return formatLocationDisplay(location, 'name-state');
    
    case 'long':
      return formatLocationDisplay(location, 'full');
    
    default:
      return location.name;
  }
}
