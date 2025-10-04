'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, DollarSign, Upload, X, Plus, Calendar, Star, Shield } from 'lucide-react';
import CitySearchInput from '@/components/packages/create/CitySearchInput';
import { ImageUpload } from '@/components/packages/forms/ImageUpload';

// Import Shadcn UI components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Hot Air Balloon Ride"
                    value={data.name || ''}
                    onChange={(e) => onChange({ name: e.target.value })}
                  />
                </FormControl>
                <FormDescription>Give your activity a descriptive name</FormDescription>
                {errors.name && <FormMessage>{errors.name}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Premium Balloon Experience"
                    value={data.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                  />
                </FormControl>
                <FormDescription>A shorter title for display</FormDescription>
                {errors.title && <FormMessage>{errors.title}</FormMessage>}
              </FormItem>
            )}
          />

          <CitySearchInput
            label="Location"
            required
            value={data.place || ''}
            onChange={(value) => onChange({ place: value })}
            placeholder="Search for a city..."
          />

          <FormField
            name="activityCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Category *</FormLabel>
                <FormControl>
                  <Select
                    value={data.activityCategory || ''}
                    onValueChange={(value) => onChange({ activityCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hours) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      value={data.durationHours?.toString() || ''}
                      onChange={(e) => onChange({ durationHours: parseInt(e.target.value) || 0 })}
                    />
                  </FormControl>
                  {errors.durationHours && <FormMessage>{errors.durationHours}</FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              name="maxCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="20"
                      value={data.maxCapacity?.toString() || ''}
                      onChange={(e) => onChange({ maxCapacity: parseInt(e.target.value) || 0 })}
                    />
                  </FormControl>
                  {errors.maxCapacity && <FormMessage>{errors.maxCapacity}</FormMessage>}
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your activity, what participants will experience, highlights, etc."
                    value={data.description || ''}
                    onChange={(e) => onChange({ description: e.target.value })}
                    rows={6}
                  />
                </FormControl>
                <FormDescription>Describe what makes your activity special</FormDescription>
                {errors.description && <FormMessage>{errors.description}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    onUpload={(file) => onChange({ image: file })}
                    preview={data.image}
                    label="Upload Activity Image"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderActivityDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <FormField
            name="timing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timing *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Morning 6:00 AM - 10:00 AM"
                    value={data.timing || ''}
                    onChange={(e) => onChange({ timing: e.target.value })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="meetingPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Point *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Hotel lobby, Activity center"
                    value={data.meetingPoint || ''}
                    onChange={(e) => onChange({ meetingPoint: e.target.value })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="availableDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Days</FormLabel>
                <FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="languagesSupported"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages Supported</FormLabel>
                <FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            name="operationalHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operational Hours</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="time"
                      placeholder="Start time"
                      value={data.operationalHours?.start || ''}
                      onChange={(e) => onChange({ 
                        operationalHours: { 
                          start: e.target.value,
                          end: data.operationalHours?.end || ''
                        } 
                      })}
                    />
                    <Input
                      type="time"
                      placeholder="End time"
                      value={data.operationalHours?.end || ''}
                      onChange={(e) => onChange({ 
                        operationalHours: { 
                          start: data.operationalHours?.start || '',
                          end: e.target.value
                        } 
                      })}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Input
                      placeholder="Contact name"
                      value={data.emergencyContact?.name || ''}
                      onChange={(e) => onChange({ 
                        emergencyContact: { 
                          name: e.target.value,
                          phone: data.emergencyContact?.phone || '',
                          email: data.emergencyContact?.email || ''
                        } 
                      })}
                    />
                    <Input
                      placeholder="Phone number"
                      value={data.emergencyContact?.phone || ''}
                      onChange={(e) => onChange({ 
                        emergencyContact: { 
                          name: data.emergencyContact?.name || '',
                          phone: e.target.value,
                          email: data.emergencyContact?.email || ''
                        } 
                      })}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={data.emergencyContact?.email || ''}
                      onChange={(e) => onChange({ 
                        emergencyContact: { 
                          name: data.emergencyContact?.name || '',
                          phone: data.emergencyContact?.phone || '',
                          email: e.target.value
                        } 
                      })}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="ageRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Restrictions</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Min age"
                        value={data.ageRestrictionsDetailed?.minAge?.toString() || ''}
                        onChange={(e) => onChange({ 
                          ageRestrictionsDetailed: { 
                            ...data.ageRestrictionsDetailed, 
                            minAge: parseInt(e.target.value) || undefined 
                          } 
                        })}
                      />
                      <Input
                        type="number"
                        placeholder="Max age"
                        value={data.ageRestrictionsDetailed?.maxAge?.toString() || ''}
                        onChange={(e) => onChange({ 
                          ageRestrictionsDetailed: { 
                            ...data.ageRestrictionsDetailed, 
                            maxAge: parseInt(e.target.value) || undefined 
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="importantInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Important Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Important notes, safety information, what to bring, etc."
                    value={data.importantInfo || ''}
                    onChange={(e) => onChange({ importantInfo: e.target.value })}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderVariants = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Variants</h3>
        <p className="text-gray-600 text-sm">Create different versions of your activity with varying prices and features</p>
      </div>
      
      <div className="space-y-4">
        {(data.variants || []).map((variant, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name={`variantName-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Standard Package"
                        value={variant.variantName || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, variantName: e.target.value };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`description-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of this variant"
                        value={variant.description || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, description: e.target.value };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <FormField
                name={`priceAdult-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adult Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={variant.priceAdult?.toString() || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, priceAdult: parseFloat(e.target.value) || 0 };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`priceChild-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={variant.priceChild?.toString() || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, priceChild: parseFloat(e.target.value) || 0 };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`minGuests-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        value={variant.minGuests?.toString() || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, minGuests: parseInt(e.target.value) || 1 };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`maxGuests-${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        value={variant.maxGuests?.toString() || ''}
                        onChange={(e) => {
                          const newVariants = [...(data.variants || [])];
                          newVariants[index] = { ...variant, maxGuests: parseInt(e.target.value) || 10 };
                          onChange({ variants: newVariants });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newVariants = (data.variants || []).filter((_, i) => i !== index);
                  onChange({ variants: newVariants });
                }}
                className="p-3 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
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
          className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
        >
          <Plus className="w-6 h-6 mx-auto mb-3" />
          <span className="font-medium">Add Package Variant</span>
        </Button>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <FormField
            name="cancellationPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Policy</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Free cancellation up to 24 hours before activity..."
                    value={data.cancellationPolicyText || ''}
                    onChange={(e) => onChange({ cancellationPolicyText: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormDescription>Describe your cancellation and refund policy</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms & Conditions</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {(data.termsAndConditions || []).map((term, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Add term or condition..."
                          value={term}
                          onChange={(e) => {
                            const newTerms = [...(data.termsAndConditions || [])];
                            newTerms[index] = e.target.value;
                            onChange({ termsAndConditions: newTerms });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTerms = (data.termsAndConditions || []).filter((_, i) => i !== index);
                            onChange({ termsAndConditions: newTerms });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newTerms = [...(data.termsAndConditions || []), ''];
                        onChange({ termsAndConditions: newTerms });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Term
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Important terms and conditions for this activity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            name="inclusions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inclusions</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {(data.inclusions || []).map((inclusion, index) => (
                      <div key={index} className="flex gap-3">
                        <Input
                          placeholder="Add inclusion..."
                          value={inclusion}
                          onChange={(e) => {
                            const newInclusions = [...(data.inclusions || [])];
                            newInclusions[index] = e.target.value;
                            onChange({ inclusions: newInclusions });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newInclusions = (data.inclusions || []).filter((_, i) => i !== index);
                            onChange({ inclusions: newInclusions });
                          }}
                          className="p-3 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newInclusions = [...(data.inclusions || []), ''];
                        onChange({ inclusions: newInclusions });
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Add Inclusion
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>What&apos;s included in the activity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="exclusions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exclusions</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {(data.exclusions || []).map((exclusion, index) => (
                      <div key={index} className="flex gap-3">
                        <Input
                          placeholder="Add exclusion..."
                          value={exclusion}
                          onChange={(e) => {
                            const newExclusions = [...(data.exclusions || [])];
                            newExclusions[index] = e.target.value;
                            onChange({ exclusions: newExclusions });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExclusions = (data.exclusions || []).filter((_, i) => i !== index);
                            onChange({ exclusions: newExclusions });
                          }}
                          className="p-3 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newExclusions = [...(data.exclusions || []), ''];
                        onChange({ exclusions: newExclusions });
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Add Exclusion
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>What&apos;s not included in the activity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
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
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'details' && renderActivityDetails()}
            {activeTab === 'variants' && renderVariants()}
            {activeTab === 'policies' && renderPolicies()}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
