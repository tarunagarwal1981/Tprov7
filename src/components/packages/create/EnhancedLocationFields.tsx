'use client';

import React from 'react';
import { Location, LocationDisplayFormat } from '../../../lib/types/location';
import { LocationInput, LocationMultiSelect } from '../../ui/LocationInput';
import { FormField } from '../../ui/FormField';
import { PackageType } from '../../../lib/types/wizard';

interface EnhancedLocationFieldsProps {
  packageType: PackageType;
  formData: {
    place?: string;
    fromLocation?: string;
    toLocation?: string;
    multipleDestinations?: string[];
    pickupPoints?: string[];
  };
  onFormDataChange: (updates: any) => void;
  displayFormat?: LocationDisplayFormat;
  country?: string;
}

export const EnhancedLocationFields: React.FC<EnhancedLocationFieldsProps> = ({
  packageType,
  formData,
  onFormDataChange,
  displayFormat = 'name-state',
  country = 'India'
}) => {
  const handleLocationSelect = (field: string) => (location: Location | string) => {
    if (typeof location === 'string') {
      onFormDataChange({ [field]: location });
    } else {
      onFormDataChange({ [field]: location.name });
    }
  };

  const handleMultiLocationChange = (field: string) => (locations: Location[]) => {
    const locationNames = locations.map(loc => loc.name);
    onFormDataChange({ [field]: locationNames });
  };

  const convertStringArrayToLocations = (stringArray: string[] = []): Location[] => {
    return stringArray.map((name, index) => ({
      id: `temp-${index}`,
      name,
      country,
      isPopular: false
    }));
  };

  const renderLocationFields = () => {
    switch (packageType) {
      case PackageType.TRANSFERS:
        return (
          <>
            <FormField label="City/Place" required>
              <LocationInput
                value={formData.place || ''}
                onChange={handleLocationSelect('place')}
                placeholder="Select city for transfers"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="From Location" required>
                <LocationInput
                  value={formData.fromLocation || ''}
                  onChange={handleLocationSelect('fromLocation')}
                  placeholder="Starting location"
                  displayFormat={displayFormat}
                  country={country}
                  mode="both"
                  allowCustomInput={true}
                />
              </FormField>

              <FormField label="To Location" required>
                <LocationInput
                  value={formData.toLocation || ''}
                  onChange={handleLocationSelect('toLocation')}
                  placeholder="Destination"
                  displayFormat={displayFormat}
                  country={country}
                  mode="both"
                  allowCustomInput={true}
                />
              </FormField>
            </div>

            <FormField 
              label="Pickup Points" 
              description="Add multiple pickup locations for convenience"
            >
              <LocationMultiSelect
                selectedLocations={convertStringArrayToLocations(formData.pickupPoints)}
                onLocationsChange={handleMultiLocationChange('pickupPoints')}
                placeholder="Search and add pickup points..."
                displayFormat={displayFormat}
                country={country}
                maxSelections={10}
              />
            </FormField>
          </>
        );

      case PackageType.ACTIVITY:
        return (
          <>
            <FormField label="Activity Location" required>
              <LocationInput
                value={formData.place || ''}
                onChange={handleLocationSelect('place')}
                placeholder="Where will this activity take place?"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <FormField 
              label="Pickup Points" 
              description="Where can participants be picked up from?"
            >
              <LocationMultiSelect
                selectedLocations={convertStringArrayToLocations(formData.pickupPoints)}
                onLocationsChange={handleMultiLocationChange('pickupPoints')}
                placeholder="Search and add pickup points..."
                displayFormat={displayFormat}
                country={country}
                maxSelections={5}
              />
            </FormField>
          </>
        );

      case PackageType.MULTI_CITY_PACKAGE:
      case PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL:
        return (
          <>
            <FormField label="Starting Location" required>
              <LocationInput
                value={formData.fromLocation || ''}
                onChange={handleLocationSelect('fromLocation')}
                placeholder="Where does the tour start?"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <FormField label="Ending Location" required>
              <LocationInput
                value={formData.toLocation || ''}
                onChange={handleLocationSelect('toLocation')}
                placeholder="Where does the tour end?"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <FormField 
              label="Tour Destinations" 
              required
              description="Add all the cities and places included in this tour"
            >
              <LocationMultiSelect
                selectedLocations={convertStringArrayToLocations(formData.multipleDestinations)}
                onLocationsChange={handleMultiLocationChange('multipleDestinations')}
                placeholder="Search and add tour destinations..."
                displayFormat={displayFormat}
                country={country}
                maxSelections={15}
              />
            </FormField>

            <FormField 
              label="Pickup Points" 
              description="Where can travelers be picked up from?"
            >
              <LocationMultiSelect
                selectedLocations={convertStringArrayToLocations(formData.pickupPoints)}
                onLocationsChange={handleMultiLocationChange('pickupPoints')}
                placeholder="Search and add pickup points..."
                displayFormat={displayFormat}
                country={country}
                maxSelections={10}
              />
            </FormField>
          </>
        );

      case PackageType.FIXED_DEPARTURE_WITH_FLIGHT:
        return (
          <>
            <FormField label="Departure City" required>
              <LocationInput
                value={formData.fromLocation || ''}
                onChange={handleLocationSelect('fromLocation')}
                placeholder="City of departure"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <FormField label="Arrival City" required>
              <LocationInput
                value={formData.toLocation || ''}
                onChange={handleLocationSelect('toLocation')}
                placeholder="City of arrival"
                displayFormat={displayFormat}
                country={country}
                mode="both"
              />
            </FormField>

            <FormField 
              label="Tour Destinations" 
              required
              description="All places included in this tour package"
            >
              <LocationMultiSelect
                selectedLocations={convertStringArrayToLocations(formData.multipleDestinations)}
                onLocationsChange={handleMultiLocationChange('multipleDestinations')}
                placeholder="Search and add tour destinations..."
                displayFormat={displayFormat}
                country={country}
                maxSelections={20}
              />
            </FormField>
          </>
        );

      default:
        return (
          <FormField label="Location" required>
            <LocationInput
              value={formData.place || ''}
              onChange={handleLocationSelect('place')}
              placeholder="Select location"
              displayFormat={displayFormat}
              country={country}
              mode="both"
            />
          </FormField>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Location & Destinations
        </h3>
        <p className="text-sm text-blue-700">
          Configure the locations and destinations for your {packageType.toLowerCase().replace('_', ' ')} package.
          Use the search to find cities, or enter custom locations.
        </p>
      </div>

      {renderLocationFields()}
    </div>
  );
};

export default EnhancedLocationFields;
