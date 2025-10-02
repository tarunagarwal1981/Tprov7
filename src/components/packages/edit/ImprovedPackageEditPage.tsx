'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PackageType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Eye,
  X,
  Plus,
  AlertCircle,
  Trash2,
  FileText,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Updated interfaces to match your create form
interface PricingInfo {
  adultPrice: number;
  childPrice: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  highlights?: string[];
}

interface HotelInfo {
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
}

interface PackageFormData {
  id?: string;
  type: PackageType;

  // Common fields - matching create form
  name?: string;
  title?: string;
  place?: string;
  description?: string;
  status?: string;
  image?: File | string;

  // Transfer specific
  from?: string;
  to?: string;
  transferType?: 'ONEWAY' | 'TWOWAY';
  transferServiceType?: string;
  distanceKm?: number;
  estimatedDuration?: string;
  advanceBookingHours?: number;

  // Activity specific
  timing?: string;
  durationHours?: number;

  // Package specific
  additionalNotes?: string;
  destinations?: string[];
  days?: number;
  maxGroupSize?: number;

  // Arrays - ensure they're always arrays
  inclusions?: string[];
  exclusions?: string[];
  tourInclusions?: string[];
  tourExclusions?: string[];
  itinerary?: DayItinerary[];
  hotels?: HotelInfo[];
  pricing?: PricingInfo[];
}

// Helper function to ensure arrays
const ensureArray = <T,>(value: T[] | T | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

// Helper function to safely parse JSON
const safeJsonParse = (value: any, defaultValue: any = []) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value || defaultValue;
};

// Toast notification system
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 max-w-md rounded-lg p-4 shadow-lg border ${
        type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
        type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
        type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
        'bg-blue-50 border-blue-200 text-blue-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Form components
const FormField = ({ label, required = false, children, error }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex items-center">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center text-red-600 text-xs mt-1">
        <AlertCircle className="w-3 h-3 mr-1" />
        {error}
      </div>
    )}
  </div>
);

const Input = ({ placeholder, value, onChange, type = "text", ...props }: {
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  [key: string]: any;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
    {...props}
  />
);

const Textarea = ({ placeholder, value, onChange, rows = 3 }: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) => (
  <textarea
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none"
  />
);

const Select = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ImageUpload = ({ onUpload, preview, label = "Upload Image" }: {
  onUpload: (file: File) => void;
  preview?: string | File;
  label?: string;
}) => {
  const [dragOver, setDragOver] = useState(false);
  
  const previewUrl = typeof preview === 'string' ? preview : 
                     preview instanceof File ? URL.createObjectURL(preview) : '';

  return (
    <div 
      className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 cursor-pointer group ${
        dragOver ? 'border-blue-400 bg-blue-50' : 'hover:border-gray-400 hover:bg-gray-50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          onUpload(file);
        }
      }}
    >
      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle remove logic here if needed
            }}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`inline-flex p-3 rounded-lg transition-colors ${
            dragOver ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'
          }`}>
            <Upload className={`w-6 h-6 transition-colors ${
              dragOver ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 text-sm">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

const ListManager = ({ items, onChange, placeholder }: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) => {
  const [newItem, setNewItem] = useState('');
  const safeItems = ensureArray(items);

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...safeItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(safeItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {safeItems.length > 0 && (
        <div className="space-y-2">
          {safeItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PricingSection = ({ pricing, onChange }: {
  pricing: PricingInfo[];
  onChange: (pricing: PricingInfo[]) => void;
}) => {
  const safePricing = ensureArray(pricing);

  const addPricing = () => {
    onChange([
      ...safePricing,
      { adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }
    ]);
  };

  const updatePricing = (index: number, field: keyof PricingInfo, value: any) => {
    const updated = [...safePricing];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePricing = (index: number) => {
    onChange(safePricing.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {safePricing.map((price, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Price Slab {index + 1}</h4>
            {safePricing.length > 1 && (
              <button
                type="button"
                onClick={() => removePricing(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Adult Price" required>
              <Input
                type="number"
                placeholder="0"
                value={price.adultPrice || 0}
                onChange={(value) => updatePricing(index, 'adultPrice', parseFloat(value) || 0)}
              />
            </FormField>
            <FormField label="Child Price">
              <Input
                type="number"
                placeholder="0"
                value={price.childPrice || 0}
                onChange={(value) => updatePricing(index, 'childPrice', parseFloat(value) || 0)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valid From" required>
              <Input
                type="date"
                value={price.validFrom || ''}
                onChange={(value) => updatePricing(index, 'validFrom', value)}
              />
            </FormField>
            <FormField label="Valid To" required>
              <Input
                type="date"
                value={price.validTo || ''}
                onChange={(value) => updatePricing(index, 'validTo', value)}
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <Textarea
              placeholder="Any pricing notes or conditions..."
              value={price.notes || ''}
              onChange={(value) => updatePricing(index, 'notes', value)}
              rows={2}
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        onClick={addPricing}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Another Price Slab
      </button>
    </div>
  );
};

// Itinerary Manager Component
const ItineraryManager = ({ itinerary, onChange }: {
  itinerary: DayItinerary[];
  onChange: (itinerary: DayItinerary[]) => void;
}) => {
  const safeItinerary = ensureArray(itinerary);

  const addDay = () => {
    const newDay = safeItinerary.length + 1;
    onChange([
      ...safeItinerary,
      { day: newDay, title: '', description: '', activities: [] }
    ]);
  };

  const updateDay = (index: number, field: keyof DayItinerary, value: any) => {
    const updated = [...safeItinerary];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDay = (index: number) => {
    const updated = safeItinerary.filter((_, i) => i !== index);
    // Reorder day numbers
    const reordered = updated.map((day, i) => ({ ...day, day: i + 1 }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {safeItinerary.map((day, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Day {day.day}</h4>
            <button
              type="button"
              onClick={() => removeDay(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <FormField label="Day Title" required>
            <Input
              placeholder="e.g., Arrival & City Tour"
              value={day.title || ''}
              onChange={(value) => updateDay(index, 'title', value)}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              placeholder="Describe what happens on this day..."
              value={day.description || ''}
              onChange={(value) => updateDay(index, 'description', value)}
              rows={3}
            />
          </FormField>

          <FormField label="Activities">
            <ListManager
              items={day.activities || []}
              onChange={(items) => updateDay(index, 'activities', items)}
              placeholder="Add an activity for this day"
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        onClick={addDay}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Day {safeItinerary.length + 1}
      </button>
    </div>
  );
};

// Hotels Manager Component
const HotelsManager = ({ hotels, onChange }: {
  hotels: HotelInfo[];
  onChange: (hotels: HotelInfo[]) => void;
}) => {
  const safeHotels = ensureArray(hotels);

  const addHotel = () => {
    onChange([
      ...safeHotels,
      { name: '', location: '', checkIn: '', checkOut: '', roomType: '' }
    ]);
  };

  const updateHotel = (index: number, field: keyof HotelInfo, value: string) => {
    const updated = [...safeHotels];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeHotel = (index: number) => {
    onChange(safeHotels.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {safeHotels.map((hotel, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Hotel {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeHotel(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hotel Name" required>
              <Input
                placeholder="Hotel name"
                value={hotel.name || ''}
                onChange={(value) => updateHotel(index, 'name', value)}
              />
            </FormField>
            <FormField label="Location" required>
              <Input
                placeholder="City/Area"
                value={hotel.location || ''}
                onChange={(value) => updateHotel(index, 'location', value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Check-in Date">
              <Input
                type="date"
                value={hotel.checkIn || ''}
                onChange={(value) => updateHotel(index, 'checkIn', value)}
              />
            </FormField>
            <FormField label="Check-out Date">
              <Input
                type="date"
                value={hotel.checkOut || ''}
                onChange={(value) => updateHotel(index, 'checkOut', value)}
              />
            </FormField>
            <FormField label="Room Type">
              <Input
                placeholder="e.g., Deluxe Room"
                value={hotel.roomType || ''}
                onChange={(value) => updateHotel(index, 'roomType', value)}
              />
            </FormField>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addHotel}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Hotel
      </button>
    </div>
  );
};

// Destinations Manager Component
const DestinationsManager = ({ destinations, onChange }: {
  destinations: string[];
  onChange: (destinations: string[]) => void;
}) => {
  const safeDestinations = ensureArray(destinations);

  const addDestination = () => {
    onChange([...safeDestinations, '']);
  };

  const updateDestination = (index: number, value: string) => {
    const updated = [...safeDestinations];
    updated[index] = value;
    onChange(updated);
  };

  const removeDestination = (index: number) => {
    onChange(safeDestinations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Destinations</h4>
        <button
          type="button"
          onClick={addDestination}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Destination
        </button>
      </div>

      {safeDestinations.map((destination, index) => (
        <div key={index} className="flex gap-3 items-center">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {index + 1}
          </div>
          <Input
            placeholder="Enter destination name"
            value={destination}
            onChange={(value) => updateDestination(index, value)}
          />
          <button
            type="button"
            onClick={() => removeDestination(index)}
            className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {safeDestinations.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No destinations added yet. Click "Add Destination" to start.</p>
        </div>
      )}
    </div>
  );
};

export default function ImprovedPackageEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageData, setPackageData] = useState<PackageFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'itinerary' | 'pricing'>('basic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const packageId = searchParams.get('id');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) {
        setError('No package ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching package:', packageId);

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user?.id) {
          throw new Error('Not authenticated');
        }

        const { data: packageRow, error: fetchError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', packageId)
          .maybeSingle();

        console.log('📦 Package fetch result:', { packageRow, fetchError });

        if (fetchError) {
          console.error('❌ Database error:', fetchError);
          throw fetchError;
        }

        if (!packageRow) {
          throw new Error('Package not found');
        }

        // Transform database row to form data with safe parsing
        const transformedData: PackageFormData = {
          id: packageRow.id,
          type: packageRow.type,
          title: packageRow.title || '',
          name: packageRow.title || '',
          description: packageRow.description || '',
          status: packageRow.status || 'DRAFT',
          place: packageRow.place || '',
          from: packageRow.from_location || '',
          to: packageRow.to_location || '',
          transferType: packageRow.transfer_type || 'ONEWAY',
          transferServiceType: packageRow.transfer_service_type || '',
          distanceKm: packageRow.distance_km || 0,
          estimatedDuration: packageRow.estimated_duration || '',
          advanceBookingHours: packageRow.advance_booking_hours || 24,
          timing: packageRow.timing || '',
          durationHours: packageRow.duration_hours || 0,
          days: packageRow.duration_days || 0,
          maxGroupSize: packageRow.max_group_size || 0,
          additionalNotes: packageRow.additional_notes || '',

          destinations: ensureArray(safeJsonParse(packageRow.destinations, [])),
          inclusions: ensureArray(safeJsonParse(packageRow.inclusions, [])),
          exclusions: ensureArray(safeJsonParse(packageRow.exclusions, [])),
          tourInclusions: ensureArray(safeJsonParse(packageRow.tour_inclusions, [])),
          tourExclusions: ensureArray(safeJsonParse(packageRow.tour_exclusions, [])),
          itinerary: ensureArray(safeJsonParse(packageRow.itinerary, [])),
          hotels: ensureArray(safeJsonParse(packageRow.hotels, [])),

          pricing: packageRow.pricing_slabs ?
            ensureArray(safeJsonParse(packageRow.pricing_slabs, [])) :
            [{
              adultPrice: packageRow.adult_price || 0,
              childPrice: packageRow.child_price || 0,
              validFrom: packageRow.valid_from || '',
              validTo: packageRow.valid_to || ''
            }]
        };

        console.log('✅ Transformed package data:', transformedData);
        setPackageData(transformedData);

      } catch (err: any) {
        console.error('💥 Error fetching package:', err);
        setError(err?.message || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const updatePackageData = (updates: Partial<PackageFormData>) => {
    setPackageData(prev => prev ? {
      ...prev,
      ...updates,
      destinations: updates.destinations ? ensureArray(updates.destinations) : prev.destinations,
      inclusions: updates.inclusions ? ensureArray(updates.inclusions) : prev.inclusions,
      exclusions: updates.exclusions ? ensureArray(updates.exclusions) : prev.exclusions,
      tourInclusions: updates.tourInclusions ? ensureArray(updates.tourInclusions) : prev.tourInclusions,
      tourExclusions: updates.tourExclusions ? ensureArray(updates.tourExclusions) : prev.tourExclusions,
      itinerary: updates.itinerary ? ensureArray(updates.itinerary) : prev.itinerary,
      hotels: updates.hotels ? ensureArray(updates.hotels) : prev.hotels,
      pricing: updates.pricing ? ensureArray(updates.pricing) : prev.pricing,
    } : null);
  };

  const handleSave = async () => {
    if (!packageData || !packageId) return;

    try {
      setSaving(true);
      console.log('💾 Saving package updates:', packageData);
      console.log('🔍 Package type:', packageData.type);
      console.log('🔍 Package data keys:', Object.keys(packageData));
      console.log('🔍 Pricing data:', packageData.pricing);
      console.log('🔍 Vehicle configs:', packageData.vehicleConfigs);

      const updateData = {
        title: packageData.title || packageData.name || '',
        description: packageData.description || '',
        status: packageData.status || 'DRAFT',
        type: packageData.type,
        place: packageData.place || null,
        from_location: packageData.from || null,
        to_location: packageData.to || null,
        transfer_service_type: packageData.transferServiceType || null,
        distance_km: packageData.distanceKm || null,
        estimated_duration: packageData.estimatedDuration || null,
        advance_booking_hours: packageData.advanceBookingHours || null,
        timing: packageData.timing || null,
        duration_hours: packageData.durationHours || 0,
        duration_days: packageData.days || 0,
        max_group_size: packageData.maxGroupSize || null,
        additional_notes: packageData.additionalNotes || null,

        destinations: packageData.destinations && packageData.destinations.length > 0 ?
          JSON.stringify(packageData.destinations) : null,
        inclusions: packageData.inclusions && packageData.inclusions.length > 0 ?
          JSON.stringify(packageData.inclusions) : null,
        exclusions: packageData.exclusions && packageData.exclusions.length > 0 ?
          JSON.stringify(packageData.exclusions) : null,
        tour_inclusions: packageData.tourInclusions && packageData.tourInclusions.length > 0 ?
          JSON.stringify(packageData.tourInclusions) : null,
        tour_exclusions: packageData.tourExclusions && packageData.tourExclusions.length > 0 ?
          JSON.stringify(packageData.tourExclusions) : null,
        itinerary: packageData.itinerary && packageData.itinerary.length > 0 ?
          JSON.stringify(packageData.itinerary) : null,
        hotels: packageData.hotels && packageData.hotels.length > 0 ?
          JSON.stringify(packageData.hotels) : null,

        pricing_slabs: packageData.pricing && packageData.pricing.length > 0 ?
          JSON.stringify(packageData.pricing) : null,
        adult_price: packageData.pricing?.[0]?.adultPrice || 0,
        child_price: packageData.pricing?.[0]?.childPrice || 0,

        updated_at: new Date().toISOString()
      };

      console.log('🔄 Update payload:', updateData);
      console.log('🔍 Pricing slabs being sent:', updateData.pricing_slabs);
      console.log('🔍 Adult price being sent:', updateData.adult_price);
      console.log('🔍 Child price being sent:', updateData.child_price);

      const { error: updateError } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', packageId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
        throw updateError;
      }

      console.log('✅ Package updated successfully');
      showToast('Package updated successfully!', 'success');

      setTimeout(() => {
        router.push(`/operator/packages/view?id=${packageId}`);
      }, 1500);

    } catch (err: any) {
      console.error('💥 Error saving package:', err);
      console.error('💥 Error stack:', err?.stack);
      console.error('💥 Error details:', JSON.stringify(err, null, 2));
      showToast(err?.message || 'Failed to save package', 'error');
      setError(err?.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/operator/packages/view?id=${packageId}`);
  };

  const handleView = () => {
    router.push(`/operator/packages/view?id=${packageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The package you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/operator/packages')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'details', label: 'Details', icon: Package },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    ...(packageData.type !== PackageType.TRANSFERS ? [{ id: 'pricing', label: 'Pricing', icon: DollarSign }] : [])
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const typeOptions = [
    { value: PackageType.TRANSFERS, label: 'Transfers' },
    { value: PackageType.ACTIVITY, label: 'Activities' },
    { value: PackageType.MULTI_CITY_PACKAGE, label: 'Multi City Package' },
    { value: PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL, label: 'Multi City + Hotels' },
    { value: PackageType.FIXED_DEPARTURE_WITH_FLIGHT, label: 'Fixed Departure' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
                <p className="text-gray-600">{packageData.title || packageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleView}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Package
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FormField label="Package Title" required>
                    <Input
                      placeholder="Enter package title"
                      value={packageData.title || ''}
                      onChange={(value) => updatePackageData({ title: value })}
                    />
                  </FormField>

                  <FormField label="Description">
                    <Textarea
                      placeholder="Describe your package..."
                      value={packageData.description || ''}
                      onChange={(value) => updatePackageData({ description: value })}
                      rows={4}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Package Type" required>
                      <Select
                        value={packageData.type || ''}
                        onChange={(value) => updatePackageData({ type: value as PackageType })}
                        options={typeOptions}
                        placeholder="Select type"
                      />
                    </FormField>

                    <FormField label="Status" required>
                      <Select
                        value={packageData.status || ''}
                        onChange={(value) => updatePackageData({ status: value })}
                        options={statusOptions}
                        placeholder="Select status"
                      />
                    </FormField>
                  </div>

                  {packageData.type === PackageType.TRANSFERS && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Transfers packages use a specialized form.</p>
                      <button
                        onClick={() => window.location.href = `/operator/packages/transfers/edit?id=${packageId}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Open Transfers Edit Form
                      </button>
                      </div>
                  )}

                  {packageData.type === PackageType.ACTIVITY && (
                    <>
                      <FormField label="Place/Destination" required>
                        <Select
                          value={packageData.place || ''}
                          onChange={(value) => updatePackageData({ place: value })}
                          options={[
                            { value: 'mumbai', label: 'Mumbai' },
                            { value: 'delhi', label: 'Delhi' },
                            { value: 'bangalore', label: 'Bangalore' },
                            { value: 'goa', label: 'Goa' },
                            { value: 'kerala', label: 'Kerala' }
                          ]}
                          placeholder="Select destination"
                        />
                      </FormField>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Timing" required>
                          <Input
                            placeholder="e.g., 9:00 AM - 5:00 PM"
                            value={packageData.timing || ''}
                            onChange={(value) => updatePackageData({ timing: value })}
                          />
                        </FormField>
                        <FormField label="Duration (Hours)" required>
                          <Input
                            type="number"
                            placeholder="e.g., 8"
                            value={packageData.durationHours || 0}
                            onChange={(value) => updatePackageData({ durationHours: parseInt(value) || 0 })}
                          />
                        </FormField>
                      </div>
                    </>
                  )}

                  {(packageData.type === PackageType.MULTI_CITY_PACKAGE || 
                    packageData.type === PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL ||
                    packageData.type === PackageType.FIXED_DEPARTURE_WITH_FLIGHT) && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Days" required>
                        <Input
                          type="number"
                          placeholder="Number of days"
                          value={packageData.days || 0}
                          onChange={(value) => updatePackageData({ days: parseInt(value) || 0 })}
                        />
                      </FormField>
                      <FormField label="Max Group Size">
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          value={packageData.maxGroupSize || 0}
                          onChange={(value) => updatePackageData({ maxGroupSize: parseInt(value) || 0 })}
                        />
                      </FormField>
                    </div>
                  )}

                  <FormField label="Package Image">
                    <ImageUpload
                      onUpload={(file) => updatePackageData({ image: file })}
                      preview={packageData.image}
                      label="Upload Package Image"
                    />
                  </FormField>

                  <FormField label="Additional Notes">
                    <Textarea
                      placeholder="Enter any additional notes..."
                      value={packageData.additionalNotes || ''}
                      onChange={(value) => updatePackageData({ additionalNotes: value })}
                    />
                  </FormField>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FormField label="Inclusions">
                    <ListManager
                      items={packageData.inclusions || []}
                      onChange={(items) => updatePackageData({ inclusions: items })}
                      placeholder="Add an inclusion (e.g., Accommodation)"
                    />
                  </FormField>

                  <FormField label="Exclusions">
                    <ListManager
                      items={packageData.exclusions || []}
                      onChange={(items) => updatePackageData({ exclusions: items })}
                      placeholder="Add an exclusion (e.g., Meals not specified)"
                    />
                  </FormField>

                  {(packageData.type === PackageType.MULTI_CITY_PACKAGE || 
                    packageData.type === PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL ||
                    packageData.type === PackageType.FIXED_DEPARTURE_WITH_FLIGHT) && (
                    <FormField label="Destinations">
                      <DestinationsManager
                        destinations={packageData.destinations || []}
                        onChange={(items) => updatePackageData({ destinations: items })}
                      />
                    </FormField>
                  )}

                  {packageData.type !== PackageType.ACTIVITY && (
                    <>
                      <FormField label="Tour Inclusions">
                        <ListManager
                          items={packageData.tourInclusions || []}
                          onChange={(items) => updatePackageData({ tourInclusions: items })}
                          placeholder="Add a tour inclusion"
                        />
                      </FormField>

                      <FormField label="Tour Exclusions">
                        <ListManager
                          items={packageData.tourExclusions || []}
                          onChange={(items) => updatePackageData({ tourExclusions: items })}
                          placeholder="Add a tour exclusion"
                        />
                      </FormField>
                    </>
                  )}

                  {packageData.type === PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL && (
                    <FormField label="Hotels">
                      <HotelsManager
                        hotels={packageData.hotels || []}
                        onChange={(items) => updatePackageData({ hotels: items })}
                      />
                    </FormField>
                  )}
                </motion.div>
              )}

              {activeTab === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FormField label="Day-wise Itinerary">
                    <ItineraryManager
                      itinerary={packageData.itinerary || []}
                      onChange={(items) => updatePackageData({ itinerary: items })}
                    />
                  </FormField>
                </motion.div>
              )}

              {activeTab === 'pricing' && packageData.type !== PackageType.TRANSFERS && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <PricingSection
                    pricing={packageData.pricing || []}
                    onChange={(items) => updatePackageData({ pricing: items })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
