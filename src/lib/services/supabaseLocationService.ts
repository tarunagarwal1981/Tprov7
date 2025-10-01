import { supabase } from '../supabase';
import { Location, LocationSearchParams, LocationSearchResult } from '../types/location';

export class SupabaseLocationService {
  /**
   * Search cities using Supabase database
   */
  static async searchCities(params: LocationSearchParams): Promise<LocationSearchResult> {
    const { query, country = 'India', limit = 10 } = params;

    try {
      const { data, error } = await supabase.rpc('search_cities', {
        search_query: query,
        country_filter: country,
        limit_count: limit
      });

      if (error) {
        console.error('Supabase search error:', error);
        throw new Error('Failed to search cities');
      }

      const locations: Location[] = data.map((city: any) => ({
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        coordinates: city.coordinates,
        population: city.population,
        isPopular: city.is_popular
      }));

      return {
        locations,
        total: locations.length,
        hasMore: locations.length === limit
      };
    } catch (error) {
      console.error('Error searching cities:', error);
      return { locations: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get popular cities from database
   */
  static async getPopularCities(country: string = 'India', limit: number = 20): Promise<Location[]> {
    try {
      const { data, error } = await supabase.rpc('get_popular_cities', {
        country_filter: country,
        limit_count: limit
      });

      if (error) {
        console.error('Supabase popular cities error:', error);
        throw new Error('Failed to fetch popular cities');
      }

      return data.map((city: any) => ({
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        coordinates: city.coordinates,
        population: city.population,
        isPopular: true
      }));
    } catch (error) {
      console.error('Error fetching popular cities:', error);
      return [];
    }
  }

  /**
   * Get all countries
   */
  static async getCountries(): Promise<{ code: string; name: string }[]> {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Supabase countries error:', error);
        throw new Error('Failed to fetch countries');
      }

      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [
        { code: 'IN', name: 'India' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' }
      ];
    }
  }

  /**
   * Get states for a country
   */
  static async getStates(countryCode: string): Promise<{ id: string; name: string; code: string }[]> {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('id, name, code')
        .eq('is_active', true)
        .eq('country_id', countryCode)
        .order('name');

      if (error) {
        console.error('Supabase states error:', error);
        throw new Error('Failed to fetch states');
      }

      return data;
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  /**
   * Add a new city (admin only)
   */
  static async addCity(cityData: {
    name: string;
    country: string;
    state?: string;
    coordinates?: { lat: number; lng: number };
    population?: number;
    isPopular?: boolean;
  }): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert([cityData])
        .select()
        .single();

      if (error) {
        console.error('Supabase add city error:', error);
        throw new Error('Failed to add city');
      }

      return {
        id: data.id,
        name: data.name,
        country: data.country,
        state: data.state,
        coordinates: data.coordinates,
        population: data.population,
        isPopular: data.is_popular
      };
    } catch (error) {
      console.error('Error adding city:', error);
      return null;
    }
  }

  /**
   * Update city popularity (admin only)
   */
  static async updateCityPopularity(cityId: string, isPopular: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cities')
        .update({ is_popular: isPopular })
        .eq('id', cityId);

      if (error) {
        console.error('Supabase update city error:', error);
        throw new Error('Failed to update city');
      }

      return true;
    } catch (error) {
      console.error('Error updating city:', error);
      return false;
    }
  }

  /**
   * Get city by ID
   */
  static async getCityById(cityId: string): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Supabase get city error:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        country: data.country,
        state: data.state,
        coordinates: data.coordinates,
        population: data.population,
        isPopular: data.is_popular
      };
    } catch (error) {
      console.error('Error fetching city:', error);
      return null;
    }
  }

  /**
   * Search cities with full-text search
   */
  static async searchCitiesFullText(query: string, country?: string, limit: number = 10): Promise<Location[]> {
    try {
      let queryBuilder = supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .textSearch('name', query, { type: 'websearch' })
        .limit(limit);

      if (country) {
        queryBuilder = queryBuilder.eq('country', country);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Supabase full-text search error:', error);
        throw new Error('Failed to search cities');
      }

      return data.map((city: any) => ({
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        coordinates: city.coordinates,
        population: city.population,
        isPopular: city.is_popular
      }));
    } catch (error) {
      console.error('Error in full-text search:', error);
      return [];
    }
  }
}
