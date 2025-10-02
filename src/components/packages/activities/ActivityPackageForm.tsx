'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, DollarSign, Upload, X, Plus, Calendar, Star, Shield } from 'lucide-react';
import { FormField } from '@/components/packages/forms/FormField';
import { Input } from '@/components/packages/forms/Input';
import { Textarea } from '@/components/packages/forms/Textarea';
import { Select } from '@/components/packages/forms/Select';
import CitySearchInput from '@/components/packages/create/CitySearchInput';
import { ImageUpload } from '@/components/packages/forms/ImageUpload';

export interface ActivityFormData {
  // Basic Info
  name?: string;
  title?: string;
  place?: string;
  description?: string;
  image?: File | string;
  
  // Activity Specific
  activityCategory?: string;
  timing?: string;
  durationHours?: number;
  availableDays?: string[];
  operationalHours?: {
    start: string;
    end: string;
  };
  meetingPoint?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    email: string;
  };
  transferOptions?: string[];
  maxCapacity?: number;
  languagesSupported?: string[];
  accessibilityInfo?: string[];
  ageRestrictionsDetailed?: {
    minAge?: number;
    maxAge?: number;
    adultSupervision?: boolean;
    notes?: string;
  };
  importantInfo?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  
  // Variants
  variants?: Array<{
    variantName: string;
    description: string;
    inclusions: string[];
    exclusions: string[];
    priceAdult: number;
    priceChild: number;
    priceInfant: number;
    minGuests: number;
    maxGuests: number;
    isActive: boolean;
  }>;
  
  // Policies
  cancellationPolicyText?: string;
  termsAndConditions?: string[];
  inclusions?: string[];
  exclusions?: string[];
}

interface ActivityPackageFormProps {
  data: ActivityFormData;
  onChange: (data: Partial<ActivityFormData>) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'edit';
}

export function ActivityPackageForm({ 
  data, 
  onChange, 
  errors = {}, 
  mode = 'create' 
}: ActivityPackageFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'variants' | 'policies'>('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: MapPin },
    { id: 'details', label: 'Activity Details', icon: Clock },
    { id: 'variants', label: 'Package Variants', icon: Star },
    { id: 'policies', label: 'Policies & Terms', icon: Shield }
  ];

  const activityCategories = [
    { value: 'ADVENTURE', label: 'Adventure & Sports' },
    { value: 'CULTURAL', label: 'Cultural & Heritage' },
    { value: 'NATURE', label: 'Nature & Wildlife' },
    { value: 'ENTERTAINMENT', label: 'Entertainment & Shows' },
    { value: 'FOOD', label: 'Food & Culinary' },
    { value: 'WELLNESS', label: 'Wellness & Spa' },
    { value: 'EDUCATIONAL', label: 'Educational & Learning' },
    { value: 'SHOPPING', label: 'Shopping & Markets' }
  ];

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
  ];

  const languages = [
    { value: 'ENGLISH', label: 'English' },
    { value: 'HINDI', label: 'Hindi' },
    { value: 'SPANISH', label: 'Spanish' },
    { value: 'FRENCH', label: 'French' },
    { value: 'GERMAN', label: 'German' },
    { value: 'ITALIAN', label: 'Italian' },
    { value: 'PORTUGUESE', label: 'Portuguese' },
    { value: 'CHINESE', label: 'Chinese' },
    { value: 'JAPANESE', label: 'Japanese' },
    { value: 'ARABIC', label: 'Arabic' }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FormField 
            label="Activity Name" 
            required
            description="Give your activity a descriptive name"
            error={errors.name}
          >
            <Input
              placeholder="e.g., Hot Air Balloon Ride"
              value={data.name || ''}
              onChange={(value) => onChange({ name: value })}
            />
          </FormField>

          <FormField 
            label="Activity Title" 
            required
            description="A shorter title for display"
            error={errors.title}
          >
            <Input
              placeholder="e.g., Premium Balloon Experience"
              value={data.title || ''}
              onChange={(value) => onChange({ title: value })}
            />
          </FormField>

          <CitySearchInput
            label="Location"
            required
            value={data.place || ''}
            onChange={(value) => onChange({ place: value })}
            placeholder="Search for a city..."
            error={errors.place}
          />

          <FormField label="Activity Category" required>
            <Select
              value={data.activityCategory || ''}
              onChange={(value) => onChange({ activityCategory: value })}
              options={activityCategories}
              placeholder="Select activity category"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Duration (hours)" required error={errors.durationHours}>
              <Input
                type="number"
                placeholder="2"
                value={data.durationHours?.toString() || ''}
                onChange={(value) => onChange({ durationHours: parseInt(value) || 0 })}
              />
            </FormField>
            <FormField label="Max Capacity" error={errors.maxCapacity}>
              <Input
                type="number"
                placeholder="20"
                value={data.maxCapacity?.toString() || ''}
                onChange={(value) => onChange({ maxCapacity: parseInt(value) || 0 })}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-6">
          <FormField 
            label="Activity Description"
            description="Describe what makes your activity special"
            error={errors.description}
          >
            <Textarea
              placeholder="Describe your activity, what participants will experience, highlights, etc."
              value={data.description || ''}
              onChange={(value) => onChange({ description: value })}
              rows={6}
            />
          </FormField>

          <FormField label="Activity Image">
            <ImageUpload
              onUpload={(file) => onChange({ image: file })}
              preview={data.image}
              label="Upload Activity Image"
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderActivityDetails = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FormField label="Timing" required>
            <Input
              placeholder="e.g., Morning 6:00 AM - 10:00 AM"
              value={data.timing || ''}
              onChange={(value) => onChange({ timing: value })}
            />
          </FormField>

          <FormField label="Meeting Point" required>
            <Input
              placeholder="e.g., Hotel lobby, Activity center"
              value={data.meetingPoint || ''}
              onChange={(value) => onChange({ meetingPoint: value })}
            />
          </FormField>

          <FormField label="Available Days">
            <div className="grid grid-cols-2 gap-3">
              {daysOfWeek.map((day) => (
                <label key={day.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.availableDays?.includes(day.value) || false}
                    onChange={(e) => {
                      const currentDays = data.availableDays || [];
                      if (e.target.checked) {
                        onChange({ availableDays: [...currentDays, day.value] });
                      } else {
                        onChange({ availableDays: currentDays.filter(d => d !== day.value) });
                      }
                    }}
                    className="text-green-600"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Languages Supported">
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {languages.map((lang) => (
                <label key={lang.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.languagesSupported?.includes(lang.value) || false}
                    onChange={(e) => {
                      const currentLangs = data.languagesSupported || [];
                      if (e.target.checked) {
                        onChange({ languagesSupported: [...currentLangs, lang.value] });
                      } else {
                        onChange({ languagesSupported: currentLangs.filter(l => l !== lang.value) });
                      }
                    }}
                    className="text-green-600"
                  />
                  <span className="text-sm text-gray-700">{lang.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>

        <div className="space-y-6">
          <FormField label="Operational Hours">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="time"
                placeholder="Start time"
                value={data.operationalHours?.start || ''}
                onChange={(value) => onChange({ 
                  operationalHours: { 
                    ...data.operationalHours, 
                    start: value 
                  } 
                })}
              />
              <Input
                type="time"
                placeholder="End time"
                value={data.operationalHours?.end || ''}
                onChange={(value) => onChange({ 
                  operationalHours: { 
                    ...data.operationalHours, 
                    end: value 
                  } 
                })}
              />
            </div>
          </FormField>

          <FormField label="Emergency Contact">
            <div className="space-y-3">
              <Input
                placeholder="Contact name"
                value={data.emergencyContact?.name || ''}
                onChange={(value) => onChange({ 
                  emergencyContact: { 
                    ...data.emergencyContact, 
                    name: value 
                  } 
                })}
              />
              <Input
                placeholder="Phone number"
                value={data.emergencyContact?.phone || ''}
                onChange={(value) => onChange({ 
                  emergencyContact: { 
                    ...data.emergencyContact, 
                    phone: value 
                  } 
                })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={data.emergencyContact?.email || ''}
                onChange={(value) => onChange({ 
                  emergencyContact: { 
                    ...data.emergencyContact, 
                    email: value 
                  } 
                })}
              />
            </div>
          </FormField>

          <FormField label="Age Restrictions">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={data.ageRestrictionsDetailed?.minAge?.toString() || ''}
                  onChange={(value) => onChange({ 
                    ageRestrictionsDetailed: { 
                      ...data.ageRestrictionsDetailed, 
                      minAge: parseInt(value) || undefined 
                    } 
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={data.ageRestrictionsDetailed?.maxAge?.toString() || ''}
                  onChange={(value) => onChange({ 
                    ageRestrictionsDetailed: { 
                      ...data.ageRestrictionsDetailed, 
                      maxAge: parseInt(value) || undefined 
                    } 
                  })}
                />
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.ageRestrictionsDetailed?.adultSupervision || false}
                  onChange={(e) => onChange({ 
                    ageRestrictionsDetailed: { 
                      ...data.ageRestrictionsDetailed, 
                      adultSupervision: e.target.checked 
                    } 
                  })}
                  className="text-green-600"
                />
                <span className="text-sm text-gray-700">Adult supervision required</span>
              </label>
            </div>
          </FormField>

          <FormField label="Important Information">
            <Textarea
              placeholder="Important notes, safety information, what to bring, etc."
              value={data.importantInfo || ''}
              onChange={(value) => onChange({ importantInfo: value })}
              rows={3}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderVariants = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Variants</h3>
        <p className="text-gray-600 text-sm">Create different versions of your activity with varying prices and features</p>
      </div>
      
      <div className="space-y-4">
        {(data.variants || []).map((variant, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Variant Name">
                <Input
                  placeholder="e.g., Standard Package"
                  value={variant.variantName || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, variantName: value };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  placeholder="Brief description of this variant"
                  value={variant.description || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, description: value };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <FormField label="Adult Price">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={variant.priceAdult?.toString() || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, priceAdult: parseFloat(value) || 0 };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
              <FormField label="Child Price">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={variant.priceChild?.toString() || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, priceChild: parseFloat(value) || 0 };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
              <FormField label="Min Guests">
                <Input
                  type="number"
                  placeholder="1"
                  value={variant.minGuests?.toString() || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, minGuests: parseInt(value) || 1 };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
              <FormField label="Max Guests">
                <Input
                  type="number"
                  placeholder="10"
                  value={variant.maxGuests?.toString() || ''}
                  onChange={(value) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, maxGuests: parseInt(value) || 10 };
                    onChange({ variants: newVariants });
                  }}
                />
              </FormField>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variant.isActive || false}
                  onChange={(e) => {
                    const newVariants = [...(data.variants || [])];
                    newVariants[index] = { ...variant, isActive: e.target.checked };
                    onChange({ variants: newVariants });
                  }}
                  className="text-green-600"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const newVariants = (data.variants || []).filter((_, i) => i !== index);
                  onChange({ variants: newVariants });
                }}
                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => {
            const newVariants = [...(data.variants || []), { 
              variantName: '', 
              description: '', 
              inclusions: [], 
              exclusions: [], 
              priceAdult: 0, 
              priceChild: 0, 
              priceInfant: 0, 
              minGuests: 1, 
              maxGuests: 10, 
              isActive: true 
            }];
            onChange({ variants: newVariants });
          }}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors hover:bg-green-50"
        >
          <Plus className="w-6 h-6 mx-auto mb-3" />
          <span className="font-medium">Add Package Variant</span>
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
              placeholder="e.g., Free cancellation up to 24 hours before activity..."
              value={data.cancellationPolicyText || ''}
              onChange={(value) => onChange({ cancellationPolicyText: value })}
              rows={4}
            />
          </FormField>

          <FormField 
            label="Terms & Conditions"
            description="Important terms and conditions for this activity"
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
            description="What's included in the activity"
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
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                + Add Inclusion
              </button>
            </div>
          </FormField>

          <FormField 
            label="Exclusions"
            description="What's not included in the activity"
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
                className="text-green-600 hover:text-green-700 text-sm font-medium"
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
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 rounded-xl mb-4 border border-green-200">
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-medium">Activity Package</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'create' ? 'Create Your Activity Package' : 'Edit Activity Package'}
        </h2>
        <p className="text-gray-600">Build a comprehensive activity package with all the details customers need</p>
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
                  ? 'bg-green-50 text-green-600 border border-green-200'
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
        {activeTab === 'details' && renderActivityDetails()}
        {activeTab === 'variants' && renderVariants()}
        {activeTab === 'policies' && renderPolicies()}
      </motion.div>
    </div>
  );
}
