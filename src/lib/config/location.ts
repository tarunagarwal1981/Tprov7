import { LocationServiceConfig } from '../types/location';

// Location service configuration
export const locationConfig: LocationServiceConfig = {
  // GeoNames API configuration
  apiKey: process.env.NEXT_PUBLIC_GEONAMES_API_KEY,
  baseUrl: 'https://api.geonames.org',
  
  // Cache configuration
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 1000,
  
  // Fallback configuration
  fallbackToStatic: true,
};

// Popular cities by country (for fallback)
export const popularCitiesByCountry = {
  India: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Surat', 'Goa', 'Kerala', 'Udaipur', 'Manali',
    'Shimla', 'Darjeeling', 'Ooty', 'Munnar', 'Alleppey', 'Kodaikanal', 'Coorg'
  ],
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
    'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville',
    'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville'
  ],
  'United Kingdom': [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds',
    'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Leicester',
    'Coventry', 'Bradford', 'Nottingham', 'Hull', 'Newcastle', 'Stoke-on-Trent',
    'Southampton', 'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Northampton'
  ],
  Australia: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast',
    'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart',
    'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat',
    'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury'
  ],
  Canada: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria',
    'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke',
    'Kelowna', 'Barrie', 'Abbotsford', 'Sudbury', 'Kingston', 'Trois-Rivieres'
  ]
};

// Display format options
export const displayFormats = {
  name: 'name' as const,
  nameState: 'name-state' as const,
  nameStateCountry: 'name-state-country' as const,
  full: 'full' as const
};

// Default search limits
export const searchLimits = {
  default: 10,
  popular: 20,
  max: 50
};

// Debounce timings
export const debounceTimings = {
  fast: 150,
  normal: 300,
  slow: 500
};

// API endpoints
export const apiEndpoints = {
  geonames: {
    search: 'https://api.geonames.org/searchJSON',
    cities: 'https://api.geonames.org/citiesJSON',
    countryInfo: 'https://api.geonames.org/countryInfoJSON'
  },
  restCountries: 'https://restcountries.com/v3.1/all'
};

// Error messages
export const errorMessages = {
  apiKeyMissing: 'GeoNames API key is not configured',
  apiRequestFailed: 'Failed to fetch location data from API',
  databaseError: 'Database query failed',
  networkError: 'Network error occurred',
  invalidQuery: 'Search query is too short',
  noResults: 'No locations found for the given query'
};

// Success messages
export const successMessages = {
  locationSelected: 'Location selected successfully',
  locationsAdded: 'Locations added successfully',
  cacheCleared: 'Location cache cleared'
};
