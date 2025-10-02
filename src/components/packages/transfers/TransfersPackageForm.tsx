'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, Clock, Users, DollarSign, Upload, X, Plus } from 'lucide-react';
import { FormField } from '@/components/packages/forms/FormField';
import { Input } from '@/components/packages/forms/Input';
import { Textarea } from '@/components/packages/forms/Textarea';
import { Select } from '@/components/packages/forms/Select';
import CitySearchInput from '@/components/packages/create/CitySearchInput';
import { ImageUpload } from '@/components/packages/forms/ImageUpload';
// import { VehicleConfigurationSection } from '@/components/packages/forms/VehicleConfigurationSection';

export interface TransfersFormData {
  // Basic Info
  name?: string;
  title?: string;
  place?: string;
  description?: string;
  image?: File | string;
  
  // Transfer Specific
  from?: string;
  to?: string;
  transferType?: 'ONEWAY' | 'TWOWAY';
  transferServiceType?: string;
  distanceKm?: number;
  estimatedDuration?: string;
  advanceBookingHours?: number;
  
  // Vehicle Configurations
  vehicleConfigs?: any[];
  
  // Additional Services
  additionalServices?: any[];
  
  // Policies
  cancellationPolicyText?: string;
  termsAndConditions?: string[];
  inclusions?: string[];
  exclusions?: string[];
}

interface TransfersPackageFormProps {
  data: TransfersFormData;
  onChange: (data: Partial<TransfersFormData>) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'edit';
}

export function TransfersPackageForm({ 
  data, 
  onChange, 
  errors = {}, 
  mode = 'create' 
}: TransfersPackageFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'vehicles' | 'services' | 'policies'>('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Car },
    { id: 'vehicles', label: 'Vehicle Options', icon: Users },
    { id: 'services', label: 'Additional Services', icon: Plus },
    { id: 'policies', label: 'Policies & Terms', icon: DollarSign }
  ];

  const transferServiceTypes = [
    { value: 'POINT_TO_POINT', label: 'Point to Point Transfer' },
    { value: 'AIRPORT_TRANSFER', label: 'Airport Transfer' },
    { value: 'CITY_TOUR', label: 'City Tour Transfer' },
    { value: 'HOURLY_RENTAL', label: 'Hourly Rental' }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FormField 
            label="Transfer Name" 
            required
            description="Give your transfer service a descriptive name"
            error={errors.name}
          >
            <Input
              placeholder="e.g., Airport to Hotel Transfer"
              value={data.name || ''}
              onChange={(value) => onChange({ name: value })}
            />
          </FormField>

          <FormField 
            label="Service Title" 
            required
            description="A shorter title for display"
            error={errors.title}
          >
            <Input
              placeholder="e.g., Premium Airport Transfer"
              value={data.title || ''}
              onChange={(value) => onChange({ title: value })}
            />
          </FormField>

          <CitySearchInput
            label="City/Place"
            required
            value={data.place || ''}
            onChange={(value) => onChange({ place: value })}
            placeholder="Search for a city..."
            error={errors.place}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="From Location" required error={errors.from}>
              <Input
                placeholder="Starting location (e.g., Airport, Hotel, Station)"
                value={data.from || ''}
                onChange={(value) => onChange({ from: value })}
              />
            </FormField>
            <FormField label="To Location" required error={errors.to}>
              <Input
                placeholder="Destination (e.g., Hotel, Airport, Station)"
                value={data.to || ''}
                onChange={(value) => onChange({ to: value })}
              />
            </FormField>
          </div>

          <FormField label="Transfer Type" required>
            <div className="flex gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="ONEWAY"
                  checked={data.transferType === 'ONEWAY'}
                  onChange={(e) => onChange({ transferType: e.target.value as 'ONEWAY' | 'TWOWAY' })}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">One Way</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="TWOWAY"
                  checked={data.transferType === 'TWOWAY'}
                  onChange={(e) => onChange({ transferType: e.target.value as 'ONEWAY' | 'TWOWAY' })}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Two Way (Round Trip)</span>
              </label>
            </div>
          </FormField>

          <FormField label="Service Type" required>
            <Select
              value={data.transferServiceType || ''}
              onChange={(value) => onChange({ transferServiceType: value })}
              options={transferServiceTypes}
              placeholder="Select service type"
            />
          </FormField>
        </div>

        <div className="space-y-6">
          <FormField 
            label="Service Description"
            description="Describe what makes your transfer service special"
            error={errors.description}
          >
            <Textarea
              placeholder="Describe your transfer service, vehicle types, amenities, etc."
              value={data.description || ''}
              onChange={(value) => onChange({ description: value })}
              rows={6}
            />
          </FormField>

          <FormField label="Transfer Image">
            <ImageUpload
              onUpload={(file) => onChange({ image: file })}
              preview={data.image}
              label="Upload Transfer Image"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Distance (km)" error={errors.distanceKm}>
              <Input
                type="number"
                placeholder="0"
                value={data.distanceKm?.toString() || ''}
                onChange={(value) => onChange({ distanceKm: parseFloat(value) || 0 })}
              />
            </FormField>
            <FormField label="Estimated Duration" error={errors.estimatedDuration}>
              <Input
                placeholder="e.g., 45 minutes"
                value={data.estimatedDuration || ''}
                onChange={(value) => onChange({ estimatedDuration: value })}
              />
            </FormField>
          </div>

          <FormField label="Advance Booking Required (hours)" error={errors.advanceBookingHours}>
            <Input
              type="number"
              placeholder="24"
              value={data.advanceBookingHours?.toString() || ''}
              onChange={(value) => onChange({ advanceBookingHours: parseInt(value) || 24 })}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderVehicleOptions = () => (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Vehicle Configuration</h3>
        <p className="text-sm">Vehicle configuration section will be implemented here</p>
      </div>
      {errors.vehicleConfigs && (
        <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          {errors.vehicleConfigs}
        </div>
      )}
    </div>
  );

  const renderAdditionalServices = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Services</h3>
        <p className="text-gray-600 text-sm">Add optional services that customers can purchase</p>
      </div>
      
      <div className="space-y-4">
        {(data.additionalServices || []).map((service, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Service Name">
                <Input
                  placeholder="e.g., Meet & Greet"
                  value={service.name || ''}
                  onChange={(value) => {
                    const newServices = [...(data.additionalServices || [])];
                    newServices[index] = { ...service, name: value };
                    onChange({ additionalServices: newServices });
                  }}
                />
              </FormField>
              <FormField label="Price">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={service.price?.toString() || ''}
                  onChange={(value) => {
                    const newServices = [...(data.additionalServices || [])];
                    newServices[index] = { ...service, price: parseFloat(value) || 0 };
                    onChange({ additionalServices: newServices });
                  }}
                />
              </FormField>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    const newServices = (data.additionalServices || []).filter((_, i) => i !== index);
                    onChange({ additionalServices: newServices });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <FormField label="Description" className="mt-4">
              <Textarea
                placeholder="Describe this additional service..."
                value={service.description || ''}
                onChange={(value) => {
                  const newServices = [...(data.additionalServices || [])];
                  newServices[index] = { ...service, description: value };
                  onChange({ additionalServices: newServices });
                }}
                rows={2}
              />
            </FormField>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => {
            const newServices = [...(data.additionalServices || []), { name: '', price: 0, description: '' }];
            onChange({ additionalServices: newServices });
          }}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors hover:bg-blue-50"
        >
          <Plus className="w-6 h-6 mx-auto mb-3" />
          <span className="font-medium">Add Additional Service</span>
        </button>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FormField 
            label="Cancellation Policy"
            description="Describe your cancellation and refund policy"
          >
            <Textarea
              placeholder="e.g., Free cancellation up to 24 hours before departure..."
              value={data.cancellationPolicyText || ''}
              onChange={(value) => onChange({ cancellationPolicyText: value })}
              rows={4}
            />
          </FormField>

          <FormField 
            label="Terms & Conditions"
            description="Important terms and conditions for this transfer"
          >
            <div className="space-y-2">
              {(data.termsAndConditions || []).map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Add term or condition..."
                    value={term}
                    onChange={(value) => {
                      const newTerms = [...(data.termsAndConditions || [])];
                      newTerms[index] = value;
                      onChange({ termsAndConditions: newTerms });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTerms = (data.termsAndConditions || []).filter((_, i) => i !== index);
                      onChange({ termsAndConditions: newTerms });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newTerms = [...(data.termsAndConditions || []), ''];
                  onChange({ termsAndConditions: newTerms });
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Term
              </button>
            </div>
          </FormField>
        </div>

        <div className="space-y-6">
          <FormField 
            label="Inclusions"
            description="What's included in the transfer service"
          >
            <div className="space-y-3">
              {(data.inclusions || []).map((inclusion, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Add inclusion..."
                    value={inclusion}
                    onChange={(value) => {
                      const newInclusions = [...(data.inclusions || [])];
                      newInclusions[index] = value;
                      onChange({ inclusions: newInclusions });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newInclusions = (data.inclusions || []).filter((_, i) => i !== index);
                      onChange({ inclusions: newInclusions });
                    }}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newInclusions = [...(data.inclusions || []), ''];
                  onChange({ inclusions: newInclusions });
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Inclusion
              </button>
            </div>
          </FormField>

          <FormField 
            label="Exclusions"
            description="What's not included in the transfer service"
          >
            <div className="space-y-3">
              {(data.exclusions || []).map((exclusion, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Add exclusion..."
                    value={exclusion}
                    onChange={(value) => {
                      const newExclusions = [...(data.exclusions || [])];
                      newExclusions[index] = value;
                      onChange({ exclusions: newExclusions });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newExclusions = (data.exclusions || []).filter((_, i) => i !== index);
                      onChange({ exclusions: newExclusions });
                    }}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newExclusions = [...(data.exclusions || []), ''];
                  onChange({ exclusions: newExclusions });
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Exclusion
              </button>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl mb-4 border border-blue-200">
          <Car className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Transfer Service</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'create' ? 'Create Your Transfer Service' : 'Edit Transfer Service'}
        </h2>
        <p className="text-gray-600">Build a comprehensive transfer package with all the details customers need</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-2 shadow-lg"
      >
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg"
      >
        {activeTab === 'basic' && renderBasicInfo()}
        {activeTab === 'vehicles' && renderVehicleOptions()}
        {activeTab === 'services' && renderAdditionalServices()}
        {activeTab === 'policies' && renderPolicies()}
      </motion.div>
    </div>
  );
}
