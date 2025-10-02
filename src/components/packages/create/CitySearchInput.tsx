'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface CityOption {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
}

interface CitySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const CitySearchInput: React.FC<CitySearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search for a city...",
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchCities(searchTerm);
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = async (query: string) => {
    setIsLoading(true);
    try {
      // Using Nominatim (OpenStreetMap) free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in,ae,sg,th,jp,us,gb,ca,au`
      );
      
      if (response.ok) {
        const data = await response.json();
        const cityOptions: CityOption[] = data
          .filter((item: any) => item.type === 'city' || item.type === 'administrative')
          .map((item: any) => ({
            name: item.name || item.display_name.split(',')[0],
            country: item.address?.country || 'Unknown',
            state: item.address?.state || item.address?.region,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }))
          .slice(0, 5);
        
        if (cityOptions.length > 0) {
          setCities(cityOptions);
        } else {
          // Fallback to predefined cities if no results
          setCities(getPredefinedCities(query));
        }
      } else {
        // Fallback to predefined cities if API fails
        setCities(getPredefinedCities(query));
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      // Fallback to predefined cities
      setCities(getPredefinedCities(query));
    } finally {
      setIsLoading(false);
    }
  };

  const getPredefinedCities = (query: string): CityOption[] => {
    const predefinedCities = [
      // Indian Cities
      { name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', country: 'India', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { name: 'Bangalore', country: 'India', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
      { name: 'Chennai', country: 'India', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
      { name: 'Kolkata', country: 'India', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
      { name: 'Hyderabad', country: 'India', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
      { name: 'Pune', country: 'India', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
      { name: 'Ahmedabad', country: 'India', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
      { name: 'Jaipur', country: 'India', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
      { name: 'Goa', country: 'India', state: 'Goa', lat: 15.2993, lng: 74.1240 },
      { name: 'Kochi', country: 'India', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
      { name: 'Mysore', country: 'India', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
      { name: 'Udaipur', country: 'India', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
      { name: 'Jodhpur', country: 'India', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
      { name: 'Agra', country: 'India', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
      { name: 'Varanasi', country: 'India', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
      { name: 'Amritsar', country: 'India', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
      { name: 'Shimla', country: 'India', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
      { name: 'Manali', country: 'India', state: 'Himachal Pradesh', lat: 32.2396, lng: 77.1887 },
      { name: 'Darjeeling', country: 'India', state: 'West Bengal', lat: 27.0360, lng: 88.2627 },
      { name: 'Ooty', country: 'India', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950 },
      { name: 'Munnar', country: 'India', state: 'Kerala', lat: 10.0889, lng: 77.0595 },
      { name: 'Alleppey', country: 'India', state: 'Kerala', lat: 9.4981, lng: 76.3388 },
      { name: 'Kovalam', country: 'India', state: 'Kerala', lat: 8.4004, lng: 76.9780 },
      { name: 'Pondicherry', country: 'India', state: 'Puducherry', lat: 11.9416, lng: 79.8083 },
      { name: 'Mahabalipuram', country: 'India', state: 'Tamil Nadu', lat: 12.6269, lng: 80.1944 },
      { name: 'Hampi', country: 'India', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
      { name: 'Gokarna', country: 'India', state: 'Karnataka', lat: 14.5500, lng: 74.3167 },
      { name: 'Pushkar', country: 'India', state: 'Rajasthan', lat: 26.4897, lng: 74.5519 },
      { name: 'Jaisalmer', country: 'India', state: 'Rajasthan', lat: 26.9157, lng: 70.9083 },
      { name: 'Bikaner', country: 'India', state: 'Rajasthan', lat: 28.0229, lng: 73.3119 },
      { name: 'Mount Abu', country: 'India', state: 'Rajasthan', lat: 24.5925, lng: 72.7156 },
      { name: 'Rishikesh', country: 'India', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },
      { name: 'Haridwar', country: 'India', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642 },
      { name: 'Mussoorie', country: 'India', state: 'Uttarakhand', lat: 30.4598, lng: 78.0644 },
      { name: 'Nainital', country: 'India', state: 'Uttarakhand', lat: 29.3919, lng: 79.4542 },
      { name: 'Corbett', country: 'India', state: 'Uttarakhand', lat: 29.3919, lng: 79.4542 },
      { name: 'Kodaikanal', country: 'India', state: 'Tamil Nadu', lat: 10.2381, lng: 77.4892 },
      { name: 'Coorg', country: 'India', state: 'Karnataka', lat: 12.3375, lng: 75.8069 },
      { name: 'Chikmagalur', country: 'India', state: 'Karnataka', lat: 13.3161, lng: 75.7720 },
      { name: 'Hampi', country: 'India', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
      { name: 'Badami', country: 'India', state: 'Karnataka', lat: 15.9149, lng: 75.6768 },
      { name: 'Pattadakal', country: 'India', state: 'Karnataka', lat: 15.9483, lng: 75.8167 },
      { name: 'Bijapur', country: 'India', state: 'Karnataka', lat: 16.8244, lng: 75.7154 },
      { name: 'Mysore', country: 'India', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
      { name: 'Srirangapatna', country: 'India', state: 'Karnataka', lat: 12.4141, lng: 76.7042 },
      { name: 'Somnathpur', country: 'India', state: 'Karnataka', lat: 12.2667, lng: 76.5833 },
      { name: 'Belur', country: 'India', state: 'Karnataka', lat: 13.1656, lng: 75.8656 },
      { name: 'Halebidu', country: 'India', state: 'Karnataka', lat: 13.2167, lng: 75.9833 },
      { name: 'Shravanabelagola', country: 'India', state: 'Karnataka', lat: 12.8667, lng: 76.4833 },
      { name: 'Murudeshwar', country: 'India', state: 'Karnataka', lat: 14.0943, lng: 74.4845 },
      { name: 'Gokarna', country: 'India', state: 'Karnataka', lat: 14.5500, lng: 74.3167 },
      { name: 'Karwar', country: 'India', state: 'Karnataka', lat: 14.8139, lng: 74.1297 },
      { name: 'Honnavar', country: 'India', state: 'Karnataka', lat: 14.2833, lng: 74.4500 },
      { name: 'Bhatkal', country: 'India', state: 'Karnataka', lat: 13.9667, lng: 74.5667 },
      { name: 'Kumta', country: 'India', state: 'Karnataka', lat: 14.4167, lng: 74.4167 },
      { name: 'Ankola', country: 'India', state: 'Karnataka', lat: 14.6667, lng: 74.3000 },
      { name: 'Sirsi', country: 'India', state: 'Karnataka', lat: 14.6167, lng: 74.8333 },
      { name: 'Yellapur', country: 'India', state: 'Karnataka', lat: 15.1333, lng: 74.7167 },
      { name: 'Dandeli', country: 'India', state: 'Karnataka', lat: 15.2667, lng: 74.6167 },
      { name: 'Hampi', country: 'India', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
      { name: 'Hospet', country: 'India', state: 'Karnataka', lat: 15.2667, lng: 76.4000 },
      { name: 'Bellary', country: 'India', state: 'Karnataka', lat: 15.1500, lng: 76.9333 },
      { name: 'Raichur', country: 'India', state: 'Karnataka', lat: 16.2000, lng: 77.3667 },
      { name: 'Gulbarga', country: 'India', state: 'Karnataka', lat: 17.3333, lng: 76.8333 },
      { name: 'Bidar', country: 'India', state: 'Karnataka', lat: 17.9000, lng: 77.5500 },
      { name: 'Bijapur', country: 'India', state: 'Karnataka', lat: 16.8244, lng: 75.7154 },
      { name: 'Bagalkot', country: 'India', state: 'Karnataka', lat: 16.1833, lng: 75.7000 },
      { name: 'Badami', country: 'India', state: 'Karnataka', lat: 15.9149, lng: 75.6768 },
      { name: 'Aihole', country: 'India', state: 'Karnataka', lat: 16.0167, lng: 75.8833 },
      { name: 'Pattadakal', country: 'India', state: 'Karnataka', lat: 15.9483, lng: 75.8167 },
      { name: 'Mahakuta', country: 'India', state: 'Karnataka', lat: 15.9333, lng: 75.7167 },
      { name: 'Banashankari', country: 'India', state: 'Karnataka', lat: 15.9167, lng: 75.7000 },
      { name: 'Kudalasangama', country: 'India', state: 'Karnataka', lat: 16.2167, lng: 75.7000 },
      { name: 'Almatti', country: 'India', state: 'Karnataka', lat: 16.3167, lng: 75.8833 },
      { name: 'Basavana Bagewadi', country: 'India', state: 'Karnataka', lat: 16.5833, lng: 75.7000 },
      { name: 'Mudhol', country: 'India', state: 'Karnataka', lat: 16.3333, lng: 75.2833 },
      { name: 'Jamkhandi', country: 'India', state: 'Karnataka', lat: 16.5167, lng: 75.3000 },
      { name: 'Bilgi', country: 'India', state: 'Karnataka', lat: 16.3500, lng: 75.6167 },
      { name: 'Hungund', country: 'India', state: 'Karnataka', lat: 16.0667, lng: 75.7667 },
      { name: 'Ilkal', country: 'India', state: 'Karnataka', lat: 15.9667, lng: 76.1333 },
      { name: 'Guledgudda', country: 'India', state: 'Karnataka', lat: 16.0500, lng: 75.8000 },
      { name: 'Terdal', country: 'India', state: 'Karnataka', lat: 16.5000, lng: 75.0500 },
      { name: 'Muddebihal', country: 'India', state: 'Karnataka', lat: 16.3333, lng: 76.1333 },
      { name: 'Devar Hippargi', country: 'India', state: 'Karnataka', lat: 16.7000, lng: 75.9000 },
      { name: 'Basavakalyan', country: 'India', state: 'Karnataka', lat: 17.8667, lng: 76.9500 },
      { name: 'Bhalki', country: 'India', state: 'Karnataka', lat: 18.0333, lng: 77.2167 },
      { name: 'Aurad', country: 'India', state: 'Karnataka', lat: 18.2500, lng: 77.4333 },
      { name: 'Humnabad', country: 'India', state: 'Karnataka', lat: 17.5833, lng: 77.0833 },
      { name: 'Afzalpur', country: 'India', state: 'Karnataka', lat: 17.2000, lng: 76.3500 },
      { name: 'Jevargi', country: 'India', state: 'Karnataka', lat: 17.0167, lng: 76.7667 },
      { name: 'Shorapur', country: 'India', state: 'Karnataka', lat: 16.5167, lng: 76.7500 },
      { name: 'Shahpur', country: 'India', state: 'Karnataka', lat: 16.7000, lng: 76.8333 },
      { name: 'Yadgir', country: 'India', state: 'Karnataka', lat: 16.7667, lng: 77.1333 },
      { name: 'Shahbad', country: 'India', state: 'Karnataka', lat: 17.1333, lng: 76.9333 },
      { name: 'Gurmatkal', country: 'India', state: 'Karnataka', lat: 16.8667, lng: 77.4000 },
      { name: 'Chitapur', country: 'India', state: 'Karnataka', lat: 17.1167, lng: 77.0833 },
      { name: 'Sedam', country: 'India', state: 'Karnataka', lat: 17.1833, lng: 77.2833 },
      { name: 'Chincholi', country: 'India', state: 'Karnataka', lat: 17.4667, lng: 77.4167 },
      { name: 'Kalaburagi', country: 'India', state: 'Karnataka', lat: 17.3333, lng: 76.8333 },
      { name: 'Aland', country: 'India', state: 'Karnataka', lat: 17.5667, lng: 76.5667 },
      { name: 'Kamalapur', country: 'India', state: 'Karnataka', lat: 17.2833, lng: 76.6167 },
      { name: 'Shahabad', country: 'India', state: 'Karnataka', lat: 17.1333, lng: 76.9333 },
      { name: 'Wadi', country: 'India', state: 'Karnataka', lat: 17.0500, lng: 76.9833 },
      { name: 'Shorapur', country: 'India', state: 'Karnataka', lat: 16.5167, lng: 76.7500 },
      { name: 'Shahpur', country: 'India', state: 'Karnataka', lat: 16.7000, lng: 76.8333 },
      { name: 'Yadgir', country: 'India', state: 'Karnataka', lat: 16.7667, lng: 77.1333 },
      { name: 'Shahbad', country: 'India', state: 'Karnataka', lat: 17.1333, lng: 76.9333 },
      { name: 'Gurmatkal', country: 'India', state: 'Karnataka', lat: 16.8667, lng: 77.4000 },
      { name: 'Chitapur', country: 'India', state: 'Karnataka', lat: 17.1167, lng: 77.0833 },
      { name: 'Sedam', country: 'India', state: 'Karnataka', lat: 17.1833, lng: 77.2833 },
      { name: 'Chincholi', country: 'India', state: 'Karnataka', lat: 17.4667, lng: 77.4167 },
      { name: 'Kalaburagi', country: 'India', state: 'Karnataka', lat: 17.3333, lng: 76.8333 },
      { name: 'Aland', country: 'India', state: 'Karnataka', lat: 17.5667, lng: 76.5667 },
      { name: 'Kamalapur', country: 'India', state: 'Karnataka', lat: 17.2833, lng: 76.6167 },
      { name: 'Shahabad', country: 'India', state: 'Karnataka', lat: 17.1333, lng: 76.9333 },
      { name: 'Wadi', country: 'India', state: 'Karnataka', lat: 17.0500, lng: 76.9833 },
      
      // International Cities
      { name: 'Dubai', country: 'UAE', state: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { name: 'Abu Dhabi', country: 'UAE', state: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { name: 'Singapore', country: 'Singapore', state: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { name: 'Bangkok', country: 'Thailand', state: 'Bangkok', lat: 13.7563, lng: 100.5018 },
      { name: 'Tokyo', country: 'Japan', state: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'New York', country: 'USA', state: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'London', country: 'UK', state: 'England', lat: 51.5074, lng: -0.1278 },
      { name: 'Paris', country: 'France', state: 'Île-de-France', lat: 48.8566, lng: 2.3522 },
      { name: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lng: 151.2093 },
      { name: 'Melbourne', country: 'Australia', state: 'VIC', lat: -37.8136, lng: 144.9631 },
      { name: 'Toronto', country: 'Canada', state: 'Ontario', lat: 43.6532, lng: -79.3832 },
      { name: 'Vancouver', country: 'Canada', state: 'BC', lat: 49.2827, lng: -123.1207 },
    ];

    return predefinedCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      (city.state && city.state.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10); // Limit to 10 results
  };

  const handleCitySelect = (city: CityOption) => {
    const displayName = city.state ? `${city.name}, ${city.state}, ${city.country}` : `${city.name}, ${city.country}`;
    setSearchTerm(displayName);
    onChange(displayName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (cities.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && cities.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {cities.map((city, index) => (
            <div
              key={index}
              onClick={() => handleCitySelect(city)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {city.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {city.state ? `${city.state}, ${city.country}` : city.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearchInput;
