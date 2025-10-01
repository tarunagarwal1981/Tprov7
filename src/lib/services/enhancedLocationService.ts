import { Location, LocationSearchParams, LocationSearchResult } from '../types/location';
import { locationService } from './locationService';
import { SupabaseLocationService } from './supabaseLocationService';

/**
 * Enhanced Location Service that combines API and database sources
 * Provides fallback mechanisms and intelligent caching
 */
export class EnhancedLocationService {
  private static instance: EnhancedLocationService;
  private cache = new Map<string, { data: Location[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): EnhancedLocationService {
    if (!EnhancedLocationService.instance) {
      EnhancedLocationService.instance = new EnhancedLocationService();
    }
    return EnhancedLocationService.instance;
  }

  /**
   * Search locations with multiple fallback strategies
   */
  public async searchLocations(params: LocationSearchParams): Promise<LocationSearchResult> {
    const { query, country = 'India', limit = 10 } = params;
    
    if (!query || query.length < 2) {
      return { locations: [], total: 0, hasMore: false };
    }

    const cacheKey = `search-${query}-${country}-${limit}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        locations: cached.slice(0, limit),
        total: cached.length,
        hasMore: cached.length > limit
      };
    }

    let results: Location[] = [];
    let hasMore = false;

    try {
      // Strategy 1: Try Supabase database first (fastest, most accurate)
      const dbResults = await SupabaseLocationService.searchCities(params);
      if (dbResults.locations.length > 0) {
        results = dbResults.locations;
        hasMore = dbResults.hasMore;
      }
    } catch (error) {
      console.warn('Database search failed, trying API:', error);
    }

    // Strategy 2: If database fails or returns few results, try API
    if (results.length < 3) {
      try {
        const apiResults = await locationService.searchLocations(params);
        if (apiResults.locations.length > 0) {
          // Merge results, prioritizing database results
          const existingIds = new Set(results.map(r => r.id));
          const newResults = apiResults.locations.filter(r => !existingIds.has(r.id));
          results = [...results, ...newResults];
          hasMore = apiResults.hasMore;
        }
      } catch (error) {
        console.warn('API search failed:', error);
      }
    }

    // Strategy 3: If still no results, use static fallback
    if (results.length === 0) {
      try {
        const staticResults = await locationService.searchLocations(params);
        results = staticResults.locations;
        hasMore = staticResults.hasMore;
      } catch (error) {
        console.error('All search strategies failed:', error);
      }
    }

    // Cache the results
    this.setCache(cacheKey, results);

    return {
      locations: results.slice(0, limit),
      total: results.length,
      hasMore: hasMore || results.length > limit
    };
  }

  /**
   * Get popular cities with caching
   */
  public async getPopularCities(country: string = 'India', limit: number = 20): Promise<Location[]> {
    const cacheKey = `popular-${country}-${limit}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    let results: Location[] = [];

    try {
      // Try database first
      results = await SupabaseLocationService.getPopularCities(country, limit);
    } catch (error) {
      console.warn('Database popular cities failed, using API:', error);
      
      try {
        // Fallback to API
        results = await locationService.getPopularCities(country);
      } catch (apiError) {
        console.error('API popular cities failed:', apiError);
      }
    }

    // Cache the results
    this.setCache(cacheKey, results);

    return results.slice(0, limit);
  }

  /**
   * Get countries with caching
   */
  public async getCountries(): Promise<{ code: string; name: string }[]> {
    const cacheKey = 'countries';
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as any;
    }

    let results: { code: string; name: string }[] = [];

    try {
      // Try database first
      results = await SupabaseLocationService.getCountries();
    } catch (error) {
      console.warn('Database countries failed, using API:', error);
      
      try {
        // Fallback to API
        results = await locationService.getCountries();
      } catch (apiError) {
        console.error('API countries failed:', apiError);
      }
    }

    // Cache the results
    this.setCache(cacheKey, results);

    return results;
  }

  /**
   * Get location by ID with multiple sources
   */
  public async getLocationById(id: string): Promise<Location | null> {
    try {
      // Try database first
      const dbResult = await SupabaseLocationService.getCityById(id);
      if (dbResult) {
        return dbResult;
      }
    } catch (error) {
      console.warn('Database get by ID failed, trying API:', error);
    }

    try {
      // Fallback to API/static data
      return await locationService.getLocationById(id);
    } catch (error) {
      console.error('All get by ID strategies failed:', error);
      return null;
    }
  }

  /**
   * Add a new city (admin function)
   */
  public async addCity(cityData: {
    name: string;
    country: string;
    state?: string;
    coordinates?: { lat: number; lng: number };
    population?: number;
    isPopular?: boolean;
  }): Promise<Location | null> {
    try {
      const result = await SupabaseLocationService.addCity(cityData);
      if (result) {
        // Clear relevant caches
        this.clearCache();
      }
      return result;
    } catch (error) {
      console.error('Failed to add city:', error);
      return null;
    }
  }

  /**
   * Update city popularity (admin function)
   */
  public async updateCityPopularity(cityId: string, isPopular: boolean): Promise<boolean> {
    try {
      const result = await SupabaseLocationService.updateCityPopularity(cityId, isPopular);
      if (result) {
        // Clear relevant caches
        this.clearCache();
      }
      return result;
    } catch (error) {
      console.error('Failed to update city popularity:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[]; hitRate: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 0 // Could implement hit rate tracking if needed
    };
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // Private cache methods
  private getFromCache(key: string): Location[] | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: Location[]): void {
    // Simple LRU eviction if cache gets too large
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const enhancedLocationService = EnhancedLocationService.getInstance();
