import { 
  Location, 
  LocationSearchParams, 
  LocationSearchResult, 
  LocationServiceConfig,
  LocationCache 
} from '../types/location';

export class LocationService {
  private static instance: LocationService;
  private cache: LocationCache = {};
  private config: LocationServiceConfig;
  
  // Static fallback data for common cities
  private static readonly COMMON_CITIES: Location[] = [
    { id: 'mumbai', name: 'Mumbai', country: 'India', state: 'Maharashtra', isPopular: true },
    { id: 'delhi', name: 'Delhi', country: 'India', state: 'Delhi', isPopular: true },
    { id: 'bangalore', name: 'Bangalore', country: 'India', state: 'Karnataka', isPopular: true },
    { id: 'goa', name: 'Goa', country: 'India', state: 'Goa', isPopular: true },
    { id: 'kerala', name: 'Kerala', country: 'India', state: 'Kerala', isPopular: true },
    { id: 'chennai', name: 'Chennai', country: 'India', state: 'Tamil Nadu', isPopular: true },
    { id: 'hyderabad', name: 'Hyderabad', country: 'India', state: 'Telangana', isPopular: true },
    { id: 'pune', name: 'Pune', country: 'India', state: 'Maharashtra', isPopular: true },
    { id: 'kolkata', name: 'Kolkata', country: 'India', state: 'West Bengal', isPopular: true },
    { id: 'ahmedabad', name: 'Ahmedabad', country: 'India', state: 'Gujarat', isPopular: true },
    { id: 'jaipur', name: 'Jaipur', country: 'India', state: 'Rajasthan', isPopular: true },
    { id: 'udaipur', name: 'Udaipur', country: 'India', state: 'Rajasthan', isPopular: true },
    { id: 'manali', name: 'Manali', country: 'India', state: 'Himachal Pradesh', isPopular: true },
    { id: 'shimla', name: 'Shimla', country: 'India', state: 'Himachal Pradesh', isPopular: true },
    { id: 'darjeeling', name: 'Darjeeling', country: 'India', state: 'West Bengal', isPopular: true },
    { id: 'ooty', name: 'Ooty', country: 'India', state: 'Tamil Nadu', isPopular: true },
    { id: 'munnar', name: 'Munnar', country: 'India', state: 'Kerala', isPopular: true },
    { id: 'alleppey', name: 'Alleppey', country: 'India', state: 'Kerala', isPopular: true },
    { id: 'kodaikanal', name: 'Kodaikanal', country: 'India', state: 'Tamil Nadu', isPopular: true },
    { id: 'coorg', name: 'Coorg', country: 'India', state: 'Karnataka', isPopular: true },
  ];

  private constructor(config?: Partial<LocationServiceConfig>) {
    this.config = {
      baseUrl: 'https://api.geonames.org',
      cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxCacheSize: 1000,
      fallbackToStatic: true,
      ...config
    };
  }

  public static getInstance(config?: Partial<LocationServiceConfig>): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService(config);
    }
    return LocationService.instance;
  }

  /**
   * Search for cities/locations based on query
   */
  public async searchLocations(params: LocationSearchParams): Promise<LocationSearchResult> {
    const { query, country = 'India', limit = 10, includeCoordinates = true } = params;
    
    if (!query || query.length < 2) {
      return { locations: [], total: 0, hasMore: false };
    }

    const cacheKey = this.generateCacheKey(params);
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return {
        locations: cachedResult.slice(0, limit),
        total: cachedResult.length,
        hasMore: cachedResult.length > limit
      };
    }

    try {
      // Try API first
      const apiResults = await this.searchFromAPI(params);
      
      if (apiResults.length > 0) {
        this.setCache(cacheKey, apiResults);
        return {
          locations: apiResults.slice(0, limit),
          total: apiResults.length,
          hasMore: apiResults.length > limit
        };
      }
    } catch (error) {
      console.warn('API search failed, falling back to static data:', error);
    }

    // Fallback to static data
    if (this.config.fallbackToStatic) {
      const staticResults = this.searchFromStatic(query, country);
      this.setCache(cacheKey, staticResults);
      return {
        locations: staticResults.slice(0, limit),
        total: staticResults.length,
        hasMore: staticResults.length > limit
      };
    }

    return { locations: [], total: 0, hasMore: false };
  }

  /**
   * Get popular cities for a country
   */
  public async getPopularCities(country: string = 'India'): Promise<Location[]> {
    const cacheKey = `popular-${country}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const popular = LocationService.COMMON_CITIES.filter(city => 
      city.country.toLowerCase() === country.toLowerCase() && city.isPopular
    );

    this.setCache(cacheKey, popular);
    return popular;
  }

  /**
   * Get location by ID
   */
  public async getLocationById(id: string): Promise<Location | null> {
    // Check static data first
    const staticLocation = LocationService.COMMON_CITIES.find(city => city.id === id);
    if (staticLocation) {
      return staticLocation;
    }

    // If not found in static data, you could implement API lookup here
    return null;
  }

  /**
   * Get all countries
   */
  public async getCountries(): Promise<{ code: string; name: string }[]> {
    const cacheKey = 'countries';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as any;
    }

    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const countries = await response.json();
      const formattedCountries = countries.map((country: any) => ({
        code: country.cca2,
        name: country.name.common
      })).sort((a: any, b: any) => a.name.localeCompare(b.name));

      this.setCache(cacheKey, formattedCountries);
      return formattedCountries;
    } catch (error) {
      console.warn('Failed to fetch countries, using fallback:', error);
      return [
        { code: 'IN', name: 'India' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'AU', name: 'Australia' },
        { code: 'CA', name: 'Canada' }
      ];
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache = {};
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache)
    };
  }

  // Private methods

  private async searchFromAPI(params: LocationSearchParams): Promise<Location[]> {
    const { query, country, limit = 10, includeCoordinates } = params;
    
    if (!this.config.apiKey) {
      throw new Error('API key not configured');
    }

    const url = new URL(`${this.config.baseUrl}/searchJSON`);
    url.searchParams.append('name_startsWith', query);
    url.searchParams.append('maxRows', limit.toString());
    url.searchParams.append('username', this.config.apiKey);
    url.searchParams.append('featureClass', 'P'); // Populated places
    url.searchParams.append('orderby', 'population');
    
    if (country) {
      url.searchParams.append('country', country);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.geonames) {
      return data.geonames.map((geo: any) => ({
        id: geo.geonameId.toString(),
        name: geo.name,
        country: geo.countryName,
        state: geo.adminName1,
        coordinates: includeCoordinates ? {
          lat: parseFloat(geo.lat),
          lng: parseFloat(geo.lng)
        } : undefined,
        population: geo.population
      }));
    }

    return [];
  }

  private searchFromStatic(query: string, country: string): Location[] {
    const lowerQuery = query.toLowerCase();
    return LocationService.COMMON_CITIES.filter(city => 
      city.country.toLowerCase() === country.toLowerCase() &&
      (city.name.toLowerCase().includes(lowerQuery) ||
       city.state?.toLowerCase().includes(lowerQuery))
    ).sort((a, b) => {
      // Prioritize exact matches and popular cities
      const aExact = a.name.toLowerCase().startsWith(lowerQuery);
      const bExact = b.name.toLowerCase().startsWith(lowerQuery);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }

  private generateCacheKey(params: LocationSearchParams): string {
    return `${params.query}-${params.country || 'all'}-${params.limit || 10}`;
  }

  private getFromCache(key: string): Location[] | null {
    const cached = this.cache[key];
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      delete this.cache[key];
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: Location[]): void {
    // Implement LRU cache eviction if needed
    if (Object.keys(this.cache).length >= this.config.maxCacheSize) {
      const oldestKey = Object.keys(this.cache)[0];
      delete this.cache[oldestKey];
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.cacheTimeout
    };
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance({
  apiKey: process.env.NEXT_PUBLIC_GEONAMES_API_KEY,
  fallbackToStatic: true
});
