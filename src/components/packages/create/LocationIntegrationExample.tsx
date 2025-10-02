'use client';

import React, { useState } from 'react';
import { Location } from '../../../lib/types/location';
import { EnhancedLocationFields } from './EnhancedLocationFields';
import { PackageType } from '../../../lib/types/wizard';

// Example component showing how to integrate the location system
export const LocationIntegrationExample: React.FC = () => {
  const [packageType, setPackageType] = useState<PackageType>(PackageType.TRANSFERS);
  const [formData, setFormData] = useState({
    place: '',
    fromLocation: '',
    toLocation: '',
    multipleDestinations: [] as string[],
    pickupPoints: [] as string[]
  });

  const handleFormDataChange = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePackageTypeChange = (type: PackageType) => {
    setPackageType(type);
    // Reset form data when package type changes
    setFormData({
      place: '',
      fromLocation: '',
      toLocation: '',
      multipleDestinations: [],
      pickupPoints: []
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Enhanced Location Fields Demo
        </h1>

        {/* Package Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Type
          </label>
          <select
            value={packageType}
            onChange={(e) => handlePackageTypeChange(e.target.value as PackageType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={PackageType.TRANSFERS}>Transfers</option>
            <option value={PackageType.ACTIVITY}>Activity</option>
            <option value={PackageType.MULTI_CITY_PACKAGE}>Multi-City Package</option>
            <option value={PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL}>Multi-City Package with Hotel</option>
            <option value={PackageType.FIXED_DEPARTURE_WITH_FLIGHT}>Fixed Departure with Flight</option>
          </select>
        </div>

        {/* Enhanced Location Fields */}
        <EnhancedLocationFields
          packageType={packageType}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          displayFormat="name-state"
          country="India"
        />

        {/* Form Data Display */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Current Form Data
          </h3>
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>

      {/* Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Integration Instructions
        </h2>
        
        <div className="space-y-4 text-sm text-blue-800">
          <div>
            <h3 className="font-semibold mb-2">1. Environment Setup:</h3>
            <p>Add your GeoNames API key to your environment variables:</p>
            <code className="block bg-blue-100 p-2 rounded mt-1">
              NEXT_PUBLIC_GEONAMES_API_KEY=your_api_key_here
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Database Setup:</h3>
            <p>Run the location schema SQL to create the cities table:</p>
            <code className="block bg-blue-100 p-2 rounded mt-1">
              Execute: src/lib/database/location-schema.sql
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Usage in Forms:</h3>
            <p>Import and use the EnhancedLocationFields component:</p>
            <code className="block bg-blue-100 p-2 rounded mt-1">
              {`import { EnhancedLocationFields } from './EnhancedLocationFields';`}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Standalone Usage:</h3>
            <p>Use individual components for specific needs:</p>
            <code className="block bg-blue-100 p-2 rounded mt-1">
              {`import { LocationInput, LocationMultiSelect } from '../../ui/LocationInput';`}
            </code>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          Features Included
        </h2>
        
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>API Integration:</strong> GeoNames API with fallback to static data
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Database Support:</strong> Supabase integration with full-text search
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Smart Caching:</strong> 5-minute cache with LRU eviction
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Debounced Search:</strong> 300ms debounce for optimal performance
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Multiple Display Formats:</strong> Name, Name-State, Name-State-Country
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Custom Input Support:</strong> Allow users to enter custom locations
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Multi-Select:</strong> Select multiple locations with badges
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Popular Cities:</strong> Pre-loaded popular destinations
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>Error Handling:</strong> Graceful fallbacks and error states
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            <strong>TypeScript Support:</strong> Full type safety and IntelliSense
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LocationIntegrationExample;
