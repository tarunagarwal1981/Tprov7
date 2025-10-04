'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  X,
  Upload,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  Star,
  FileText,
  Package,
  Plane,
  CheckCircle,
  Car,
  Building,
  AlertCircle,
  Trash2,
  Bed,
  Check,
  AlertTriangle,
  Info,
  Shield,
  Users,
  Settings,
  Wifi,
  Music,
  Coffee,
  Luggage
} from 'lucide-react';
import { ActivityPackageForm } from '@/components/packages/activities/ActivityPackageForm';

// Import the new activity form components
import ActivityDetailsForm from '@/components/packages/forms/ActivityDetailsForm';
import PackageVariantsForm from '@/components/packages/forms/PackageVariantsForm';
import { VehicleConfig, PickupPoint, AdditionalService, VehicleType, TransferServiceType } from '@/lib/types';
import { packageService } from '@/lib/services/packageService';
import CitySearchInput from './CitySearchInput';
import ActivityPoliciesForm from '@/components/packages/forms/ActivityPoliciesForm';

// Import Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

// Toast notification system
const ToastContext = createContext<{
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
} | null>(null);

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
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
      className={`fixed top-4 right-4 z-50 max-w-md rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 ${colors[type]} p-4`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
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

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Enums - matching your original code structure
export enum PackageType {
  ACTIVITY = 'ACTIVITY',
  TRANSFERS = 'TRANSFERS',
  MULTI_CITY_PACKAGE = 'MULTI_CITY_PACKAGE',
  MULTI_CITY_PACKAGE_WITH_HOTEL = 'MULTI_CITY_PACKAGE_WITH_HOTEL',
  FIXED_DEPARTURE_WITH_FLIGHT = 'FIXED_DEPARTURE_WITH_FLIGHT'
}

// Interfaces - matching your original code structure  
interface PackageFormData {
  type: PackageType;
  
  // Common fields
  name?: string;
  title?: string;
  place?: string;
  description?: string;
  image?: File | string;
  
  // Transfer specific
  from?: string;
  to?: string;
  transferServiceType?: string;
  distanceKm?: number;
  estimatedDuration?: string;
  advanceBookingHours?: number;
  cancellationPolicyText?: string;
  vehicleConfigs?: VehicleConfig[];
  pickupPoints?: PickupPoint[];
  additionalServices?: AdditionalService[];
  transferType?: 'ONEWAY' | 'TWOWAY';
  
  // Activity specific
  timing?: string;
  durationHours?: number;
  inclusions?: string[];
  exclusions?: string[];
  
  // Activity-specific fields
  activityCategory?: string;
  availableDays?: string[];
  operationalHours?: any;
  meetingPoint?: string;
  emergencyContact?: any;
  transferOptions?: string[];
  maxCapacity?: number;
  languagesSupported?: string[];
  accessibilityInfo?: string[];
  ageRestrictionsDetailed?: any;
  importantInfo?: string;
  faq?: any[];
  variants?: any[];
  
  // Package specific
  banner?: File | string;
  additionalNotes?: string;
  tourInclusions?: string[];
  tourExclusions?: string[];
  destinations?: string[];
  days?: number;
  itinerary?: DayItinerary[];
  
  // Hotel specific
  hotels?: HotelInfo[];
  
  // Pricing
  pricing?: PricingInfo[];
}

interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  highlights: string[];
}

interface HotelInfo {
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
}

interface PricingInfo {
  adultPrice: number;
  childPrice: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

// Package type selection component
const PackageTypeSelector = ({ onSelect }: { onSelect: (type: PackageType) => void }) => {
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);

  const packageTypes = [
    {
      type: PackageType.TRANSFERS,
      title: 'Transfers',
      description: 'Airport pickups, city transfers, transportation services',
      icon: Car,
      color: 'blue',
      features: ['Point to point', 'Quick setup', 'Simple pricing']
    },
    {
      type: PackageType.ACTIVITY,
      title: 'Activities',
      description: 'Day trips, tours, experiences, adventure activities',
      icon: Star,
      color: 'green',
      features: ['Duration based', 'Inclusions/exclusions', 'Flexible timing']
    },
    {
      type: PackageType.MULTI_CITY_PACKAGE,
      title: 'Multi City Package',
      description: 'Multi-day tours covering multiple destinations',
      icon: Package,
      color: 'purple',
      features: ['Multiple destinations', 'Day-wise itinerary', 'Tour inclusions']
    },
    {
      type: PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL,
      title: 'Multi City + Hotels',
      description: 'Complete packages with accommodation included',
      icon: Building,
      color: 'orange',
      features: ['Hotels included', 'Full packages', 'End-to-end service']
    },
    {
      type: PackageType.FIXED_DEPARTURE_WITH_FLIGHT,
      title: 'Fixed Departure',
      description: 'Pre-scheduled group tours with fixed dates',
      icon: Plane,
      color: 'red',
      features: ['Fixed dates', 'Group tours', 'International flights']
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'selected') => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-600', 
        border: 'border-blue-200',
        selected: 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
      },
      green: { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-600', 
        border: 'border-emerald-200',
        selected: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-300'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-600', 
        border: 'border-purple-200',
        selected: 'ring-2 ring-purple-500 bg-purple-50 border-purple-300'
      },
      orange: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-600', 
        border: 'border-orange-200',
        selected: 'ring-2 ring-orange-500 bg-orange-50 border-orange-300'
      },
      red: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        border: 'border-red-200',
        selected: 'ring-2 ring-red-500 bg-red-50 border-red-300'
      }
    };
    return colorMap[color]?.[type] || 'bg-gray-50';
  };

  const handleSelect = (type: PackageType) => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 py-2">
      {/* Improved Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Package</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">Choose the package type that best matches your travel offering</p>
      </motion.div>
      
      {/* Improved Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {packageTypes.map((pkg, index) => {
          const IconComponent = pkg.icon;
          const isSelected = selectedType === pkg.type;
          
          return (
            <motion.div
              key={pkg.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
              className={`group relative bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden shadow-lg hover:shadow-xl ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelect(pkg.type)}
            >
              <div className="p-3">
                {/* Improved Icon and Title */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex p-2 rounded-xl transition-all duration-200 ${
                    isSelected ? getColorClasses(pkg.color, 'bg') : 'bg-gray-100 group-hover:' + getColorClasses(pkg.color, 'bg')
                  }`}>
                    <IconComponent className={`w-6 h-6 transition-colors duration-200 ${
                      isSelected ? getColorClasses(pkg.color, 'text') : 'text-gray-600 group-hover:' + getColorClasses(pkg.color, 'text')
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{pkg.title}</h3>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium"
                      >
                        <Check className="w-4 h-4" />
                        Selected
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Improved Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{pkg.description}</p>
                
                {/* Improved Features */}
                <div className="space-y-2">
                  {(pkg.features || []).map((feature, featureIndex) => (
                    <div 
                      key={featureIndex} 
                      className="flex items-center text-sm text-gray-500"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                        isSelected ? getColorClasses(pkg.color, 'text').replace('text-', 'bg-') : 'bg-gray-300'
                      }`} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced form components
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  description?: string;
}

const FormField = ({ label, required = false, children, error, description }: FormFieldProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center text-red-600 text-xs"
        >
          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const Input = ({ placeholder, value, onChange, type = "text", error, ...props }: InputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
    {...props}
  />
);

interface TextareaProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
}

const Textarea = ({ placeholder, value, onChange, rows = 3, error }: TextareaProps) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md resize-none ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
  />
);

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

const Select = ({ value, onChange, options, placeholder, error }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

interface ImageUploadProps {
  onUpload: (file: File) => void;
  preview?: string | File;
  label?: string;
}

const ImageUpload = ({ onUpload, preview, label = "Upload Image" }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  
  const previewUrl = typeof preview === 'string' ? preview : 
                     preview instanceof File ? URL.createObjectURL(preview) : '';

  return (
    <div 
      className={`relative border-2 border-dashed border-white/30 rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group backdrop-blur-sm ${
        dragOver ? 'border-blue-400/50 bg-blue-50/20' : 'hover:border-white/50 hover:bg-white/10'
      }`}
      style={{
        background: dragOver 
          ? 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: dragOver 
          ? '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
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
          <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md" />
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
          <div className={`inline-flex p-3 rounded-xl transition-colors backdrop-blur-sm ${
            dragOver ? 'bg-blue-100/30' : 'bg-white/20 group-hover:bg-blue-50/30'
          }`}
          style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
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

interface ListManagerProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  title?: string;
}

const ListManager = ({ items, onChange, placeholder, title }: ListManagerProps) => {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {title && <h4 className="font-medium text-gray-900">{title}</h4>}
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 backdrop-blur-sm rounded-xl transition-colors border border-blue-200/30"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <Plus className="w-4 h-4" />
          Add {title || 'Item'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={setNewItem}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && addItem()}
            />
            <button
              onClick={addItem}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex-shrink-0 backdrop-blur-sm"
              style={{
                boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewItem('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {items.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between backdrop-blur-sm px-4 py-3 rounded-xl group border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <span className="text-sm text-gray-700 flex-1">{item}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface PricingSectionProps {
  pricing: PricingInfo[];
  onChange: (pricing: PricingInfo[]) => void;
}

const PricingSection = ({ pricing, onChange }: PricingSectionProps) => {
  const addPricing = () => {
    onChange([
      ...(pricing || []),
      { adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }
    ]);
  };

  const updatePricing = (index: number, field: keyof PricingInfo, value: any) => {
    const updated = [...(pricing || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePricing = (index: number) => {
    onChange((pricing || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Pricing Information</h4>
        <button
          onClick={addPricing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 backdrop-blur-sm rounded-xl transition-colors border border-blue-200/30"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <Plus className="w-4 h-4" />
          Add Price Slab
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {(pricing || []).map((price, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-xl border border-white/20 rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-gray-900">Price Slab {index + 1}</h5>
                {pricing.length > 1 && (
                  <button
                    onClick={() => removePricing(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Adult Price" required>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={price.adultPrice.toString()}
                      onChange={(value) => updatePricing(index, 'adultPrice', parseFloat(value) || 0)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </FormField>
                <FormField label="Child Price">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={price.childPrice.toString()}
                      onChange={(value) => updatePricing(index, 'childPrice', parseFloat(value) || 0)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Valid From" required>
                  <Input
                    type="date"
                    value={price.validFrom}
                    onChange={(value) => updatePricing(index, 'validFrom', value)}
                  />
                </FormField>
                <FormField label="Valid To" required>
                  <Input
                    type="date"
                    value={price.validTo}
                    onChange={(value) => updatePricing(index, 'validTo', value)}
                  />
                </FormField>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Package type specific forms
interface FormProps {
  data: PackageFormData;
  onChange: (data: Partial<PackageFormData>) => void;
  errors?: Record<string, string>;
}

const TransferForm = ({ data, onChange, errors }: FormProps) => {
  const places = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'goa', label: 'Goa' },
    { value: 'kerala', label: 'Kerala' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl mb-4 border border-blue-200">
          <Car className="w-5 h-5 text-blue-600" />
          <span className="text-blue-600 font-medium">Transfer Service</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Details</h2>
        <p className="text-gray-600">Create your transfer service offering</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 shadow-lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferName">Transfer Name *</Label>
              <ShadcnInput
                id="transferName"
                placeholder="e.g., Airport to Hotel Transfer"
                value={data.name || ''}
                onChange={(e) => onChange({ name: e.target.value })}
              />
              <p className="text-sm text-gray-600">Give your transfer service a descriptive name</p>
            </div>

            <CitySearchInput
              label="City/Place"
              required
              value={data.place || ''}
              onChange={(value) => onChange({ place: value })}
              placeholder="Search for a city..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From *</Label>
                <ShadcnInput
                  id="from"
                  placeholder="Starting location (e.g., Airport, Hotel, Station)"
                  value={data.from || ''}
                  onChange={(e) => onChange({ from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <ShadcnInput
                  id="to"
                  placeholder="Destination (e.g., Hotel, Airport, Station)"
                  value={data.to || ''}
                  onChange={(e) => onChange({ to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transfer Type *</Label>
              <RadioGroup 
                value={data.transferType} 
                onValueChange={(value) => onChange({ transferType: value as 'ONEWAY' | 'TWOWAY' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ONEWAY" id="oneway" />
                  <Label htmlFor="oneway">One Way</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TWOWAY" id="twoway" />
                  <Label htmlFor="twoway">Two Way (Round Trip)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <ShadcnTextarea
                placeholder="Describe your transfer service, vehicle types, amenities, etc."
                value={data.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={6}
              />
              <p className="text-sm text-gray-600">Describe what makes your transfer service special</p>
            </div>

            <div className="space-y-2">
              <Label>Transfer Image</Label>
              <ImageUpload
                onUpload={(file) => onChange({ image: file })}
                preview={data.image}
                label="Upload Transfer Image"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Configuration Section */}
        <VehicleConfigurationSection
          vehicleConfigs={data.vehicleConfigs || []}
          onChange={(vehicleConfigs) => onChange({ vehicleConfigs })}
        />
        
        {/* Show validation error for vehicle configs */}
        {errors?.vehicleConfigs && (
          <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
            {errors.vehicleConfigs}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ActivityForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'variants' | 'policies'>('basic');
  
  const places = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'goa', label: 'Goa' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'abu_dhabi', label: 'Abu Dhabi' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'bangkok', label: 'Bangkok' },
    { value: 'tokyo', label: 'Tokyo' }
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'details', label: 'Activity Details', icon: Star },
    { id: 'variants', label: 'Package Variants', icon: Package },
    { id: 'policies', label: 'Policies & FAQ', icon: Shield }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-xl mb-4 border border-emerald-200">
          <Star className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-600 font-medium">Activity Experience</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Activity</h2>
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
              className={`flex-1 flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 hover:bg-emerald-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField 
                    label="Activity Name" 
                    required
                    description="Give your activity a compelling name"
                  >
                    <Input
                      placeholder="e.g., The National Aquarium Experience"
                      value={data.title || data.name || ''}
                      onChange={(value) => onChange({ title: value, name: value })}
                    />
                  </FormField>

                  <FormField 
                    label="Destination" 
                    required
                    description="Where does this activity take place?"
                  >
                    <Select
                      value={data.place || ''}
                      onChange={(value) => onChange({ place: value })}
                      options={places}
                      placeholder="Select destination"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Timing" required>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="9:00 AM - 5:00 PM"
                          value={data.timing || ''}
                          onChange={(value) => onChange({ timing: value })}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </FormField>
                    <FormField label="Duration (Hours)" required>
                      <Input
                        type="number"
                        placeholder="8"
                        value={data.durationHours?.toString() || ''}
                        onChange={(value) => onChange({ durationHours: parseInt(value) || 0 })}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField 
                    label="Activity Description"
                    description="Describe what makes this experience special"
                  >
                    <Textarea
                      placeholder="Describe your activity, what guests will experience, highlights..."
                      value={data.description || ''}
                      onChange={(value) => onChange({ description: value })}
                      rows={8}
                    />
                  </FormField>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold mb-6">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Adult Price" required>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={data.pricing?.[0]?.adultPrice?.toString() || ''}
                        onChange={(value) => onChange({ 
                          pricing: [{ 
                            adultPrice: parseFloat(value) || 0,
                            childPrice: data.pricing?.[0]?.childPrice || 0,
                            validFrom: data.pricing?.[0]?.validFrom || '',
                            validTo: data.pricing?.[0]?.validTo || ''
                          }] 
                        })}
                        style={{ paddingLeft: '2rem' }}
                      />
                    </div>
                  </FormField>
                  <FormField label="Child Price">
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={data.pricing?.[0]?.childPrice?.toString() || ''}
                        onChange={(value) => onChange({ 
                          pricing: [{ 
                            adultPrice: data.pricing?.[0]?.adultPrice || 0,
                            childPrice: parseFloat(value) || 0,
                            validFrom: data.pricing?.[0]?.validFrom || '',
                            validTo: data.pricing?.[0]?.validTo || ''
                          }] 
                        })}
                        style={{ paddingLeft: '2rem' }}
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <ActivityDetailsForm
                formData={{
                  activityCategory: data.activityCategory,
                  availableDays: data.availableDays,
                  operationalHours: data.operationalHours,
                  meetingPoint: data.meetingPoint,
                  emergencyContact: data.emergencyContact,
                  transferOptions: data.transferOptions,
                  maxCapacity: data.maxCapacity,
                  languagesSupported: data.languagesSupported
                }}
                onChange={(updates) => onChange(updates)}
                errors={{}}
              />
            </motion.div>
          )}

          {activeTab === 'variants' && (
            <motion.div
              key="variants"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PackageVariantsForm
                variants={data.variants || []}
                onChange={(variants) => onChange({ variants })}
                errors={{}}
              />
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <ActivityPoliciesForm
                formData={{
                  importantInfo: data.importantInfo,
                  faq: data.faq,
                  ageRestrictionsDetailed: data.ageRestrictionsDetailed,
                  accessibilityInfo: data.accessibilityInfo
                }}
                onChange={(updates) => onChange(updates)}
                errors={{}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const MultiCityPackageForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'itinerary' | 'pricing'>('overview');

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-xl mb-4 border border-purple-200">
          <Package className="w-5 h-5 text-purple-600" />
          <span className="text-purple-600 font-medium">Multi City Package</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi City Package</h2>
        <p className="text-gray-600">Create your comprehensive tour package</p>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="m-0">
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageTitle">Package Title *</Label>
                      <ShadcnInput
                        id="packageTitle"
                        placeholder="e.g., Golden Triangle Tour"
                        value={data.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                      />
                      <p className="text-sm text-gray-600">Give your package an attractive title</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="packageDescription">Package Description</Label>
                      <ShadcnTextarea
                        id="packageDescription"
                        placeholder="Describe your package, highlights, what travelers will experience..."
                        value={data.description || ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        rows={6}
                      />
                      <p className="text-sm text-gray-600">Describe what makes this package special</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <ShadcnTextarea
                        id="additionalNotes"
                        placeholder="Any additional information for travelers..."
                        value={data.additionalNotes || ''}
                        onChange={(e) => onChange({ additionalNotes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Banner Image</Label>
                      <ImageUpload
                        onUpload={(file) => onChange({ banner: file })}
                        preview={data.banner}
                        label="Upload Package Banner"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                  <ListManager
                    items={data.tourInclusions || []}
                    onChange={(tourInclusions) => onChange({ tourInclusions })}
                    placeholder="Add tour inclusion..."
                    title="Tour Inclusions"
                  />

                  <ListManager
                    items={data.tourExclusions || []}
                    onChange={(tourExclusions) => onChange({ tourExclusions })}
                    placeholder="Add tour exclusion..."
                    title="Tour Exclusions"
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="destinations" className="m-0">
              <motion.div
                key="destinations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="text-center py-4">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Destinations</h3>
                  <p className="text-gray-600">Add all the destinations included in this package</p>
                </div>
                
                <ListManager
                  items={data.destinations || []}
                  onChange={(destinations) => onChange({ destinations })}
                  placeholder="Add destination city..."
                  title="Destinations"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="itinerary" className="m-0">
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                    <p className="text-gray-600 mt-1">Plan each day of your package</p>
                  </div>
                  <Button
                    variant="default"
                    onClick={addItineraryDay}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Day
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.itinerary || []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {day.day}
                            </div>
                            <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                          </div>
                          <button
                            onClick={() => {
                              const updated = (data.itinerary || []).filter((_, i) => i !== index);
                              onChange({ itinerary: updated });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField label="Day Title">
                            <Input
                              placeholder="e.g., Arrival in Delhi"
                              value={day.title}
                              onChange={(value) => updateItineraryDay(index, { title: value })}
                            />
                          </FormField>

                          <FormField label="Day Description">
                            <Textarea
                              placeholder="Describe the day's activities and experiences..."
                              value={day.description}
                              onChange={(value) => updateItineraryDay(index, { description: value })}
                              rows={3}
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <ListManager
                            items={day.activities}
                            onChange={(activities) => updateItineraryDay(index, { activities })}
                            placeholder="Add activity..."
                            title="Activities"
                          />

                          <ListManager
                            items={day.highlights}
                            onChange={(highlights) => updateItineraryDay(index, { highlights })}
                            placeholder="Add highlight..."
                            title="Highlights"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!data.itinerary || data.itinerary.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No itinerary days added yet. Click &quot;Add Day&quot; to start planning.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="pricing" className="m-0">
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="text-center py-4">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Pricing</h3>
                  <p className="text-gray-600">Set competitive prices for your package</p>
                </div>
                
                <PricingSection
                  pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                  onChange={(pricing) => onChange({ pricing })}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const MultiCityPackageWithHotelForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'itinerary' | 'hotels' | 'pricing'>('overview');

  const addHotel = () => {
    const newHotel: HotelInfo = {
      name: '',
      location: '',
      checkIn: '',
      checkOut: '',
      roomType: ''
    };
    onChange({ hotels: [...(data.hotels || []), newHotel] });
  };

  const updateHotel = (index: number, updates: Partial<HotelInfo>) => {
    const updated = [...(data.hotels || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ hotels: updated });
  };

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };


  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-xl mb-4 border border-orange-200">
          <Building className="w-5 h-5 text-orange-600" />
          <span className="text-orange-600 font-medium">Complete Package</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi City Package + Hotels</h2>
        <p className="text-gray-600">Create your complete package with accommodation</p>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="m-0">
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageTitle">Package Title *</Label>
                      <ShadcnInput
                        id="packageTitle"
                        placeholder="e.g., Golden Triangle Tour with Luxury Hotels"
                        value={data.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                      />
                      <p className="text-sm text-gray-600">Give your complete package an attractive title</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="packageDescription">Package Description</Label>
                      <ShadcnTextarea
                        id="packageDescription"
                        placeholder="Describe your complete package including hotels, activities, and experiences..."
                        value={data.description || ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        rows={6}
                      />
                      <p className="text-sm text-gray-600">Highlight accommodation and tour features</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Package Banner</Label>
                      <ImageUpload
                        onUpload={(file) => onChange({ banner: file })}
                        preview={data.banner}
                        label="Upload Package Banner"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                  <ListManager
                    items={data.tourInclusions || []}
                    onChange={(tourInclusions) => onChange({ tourInclusions })}
                    placeholder="Add tour inclusion..."
                    title="Tour Inclusions"
                  />

                  <ListManager
                    items={data.tourExclusions || []}
                    onChange={(tourExclusions) => onChange({ tourExclusions })}
                    placeholder="Add tour exclusion..."
                    title="Tour Exclusions"
                  />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="destinations" className="m-0">
              <motion.div
                key="destinations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="text-center py-4">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Destinations</h3>
                  <p className="text-gray-600">Add all destinations with accommodation</p>
                </div>
                
                <ListManager
                  items={data.destinations || []}
                  onChange={(destinations) => onChange({ destinations })}
                  placeholder="Add destination city..."
                  title="Destinations"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="itinerary" className="m-0">
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                    <p className="text-gray-600 mt-1">Plan each day including accommodation</p>
                  </div>
                  <Button
                    variant="default"
                    onClick={addItineraryDay}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Day
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.itinerary || []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {day.day}
                            </div>
                            <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                          </div>
                          <button
                            onClick={() => {
                              const updated = (data.itinerary || []).filter((_, i) => i !== index);
                              onChange({ itinerary: updated });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField label="Day Title">
                            <Input
                              placeholder="e.g., Arrival in Delhi"
                              value={day.title}
                              onChange={(value) => updateItineraryDay(index, { title: value })}
                            />
                          </FormField>

                          <FormField label="Day Description">
                            <Textarea
                              placeholder="Describe the day's activities, hotel check-in, etc..."
                              value={day.description}
                              onChange={(value) => updateItineraryDay(index, { description: value })}
                              rows={3}
                            />
                          </FormField>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="hotels" className="m-0">
              <motion.div
                key="hotels"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Hotel Details</h3>
                    <p className="text-gray-600 mt-1">Add accommodation details for each location</p>
                  </div>
                  <Button
                    variant="default"
                    onClick={addHotel}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hotel
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.hotels || []).map((hotel, index) => (
                      <Card key={index} className="bg-orange-50 border-orange-200">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                <Bed className="w-4 h-4" />
                              </div>
                              <h4 className="font-semibold text-gray-900">Hotel {index + 1}</h4>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = (data.hotels || []).filter((_, i) => i !== index);
                                onChange({ hotels: updated });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`hotel-name-${index}`}>Hotel Name *</Label>
                              <ShadcnInput
                                id={`hotel-name-${index}`}
                                placeholder="e.g., Taj Palace Hotel"
                                value={hotel.name}
                                onChange={(e) => updateHotel(index, { name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`hotel-location-${index}`}>Location *</Label>
                              <ShadcnInput
                                id={`hotel-location-${index}`}
                                placeholder="e.g., New Delhi"
                                value={hotel.location}
                                onChange={(e) => updateHotel(index, { location: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`checkin-${index}`}>Check-in Date *</Label>
                              <ShadcnInput
                                id={`checkin-${index}`}
                                type="date"
                                value={hotel.checkIn}
                                onChange={(e) => updateHotel(index, { checkIn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`checkout-${index}`}>Check-out Date *</Label>
                              <ShadcnInput
                                id={`checkout-${index}`}
                                type="date"
                                value={hotel.checkOut}
                                onChange={(e) => updateHotel(index, { checkOut: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`room-type-${index}`}>Room Type *</Label>
                              <ShadcnInput
                                id={`room-type-${index}`}
                                  placeholder="e.g., Deluxe Room"
                                value={hotel.roomType}
                                onChange={(e) => updateHotel(index, { roomType: e.target.value })}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AnimatePresence>

                  {(!data.hotels || data.hotels.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Bed className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No hotels added yet. Click &quot;Add Hotel&quot; to include accommodation.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="pricing" className="m-0">
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
                <div className="text-center py-4">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Pricing (Including Hotels)</h3>
                  <p className="text-gray-600">Set pricing for your complete package with accommodation</p>
                </div>
                
                <PricingSection
                  pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                  onChange={(pricing) => onChange({ pricing })}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const FixedDepartureForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'destinations' | 'itinerary' | 'pricing'>('info');
  const [departureDates, setDepartureDates] = useState<Date[]>([
    // Initialize with current date + 30 days if no existing dates
    ...((data as any).departureDates?.map((d: any) => new Date(d)) || [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)])
  ]);

  const addDepartureDate = () => {
    const newDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setDepartureDates([...departureDates, newDate]);
    const updatedData = {
      ...data,
      departureDates: [...departureDates, newDate].map(d => d.toISOString())
    } as any;
    onChange(updatedData);
  };

  const updateDepartureDate = (index: number, date: Date) => {
    const newDates = [...departureDates];
    newDates[index] = date;
    setDepartureDates(newDates);
    const updatedData = {
      ...data,
      departureDates: newDates.map(d => d.toISOString())
    } as any;
    onChange(updatedData);
  };

  const removeDepartureDate = (index: number) => {
    const newDates = departureDates.filter((_, i) => i !== index);
    setDepartureDates(newDates);
    const updatedData = {
      ...data,
      departureDates: newDates.map(d => d.toISOString())
    } as any;
    onChange(updatedData);
  };

  const addDestination = () => {
    onChange({ destinations: [...(data.destinations || []), ''] });
  };

  const updateDestination = (index: number, value: string) => {
    const updated = [...(data.destinations || [])];
    updated[index] = value;
    onChange({ destinations: updated });
  };

  const removeDestination = (index: number) => {
    const updated = (data.destinations || []).filter((_, i) => i !== index);
    onChange({ destinations: updated });
  };

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 rounded-xl mb-4 border border-red-200">
          <Plane className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-medium">Fixed Departure</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fixed Departure Package</h2>
        <p className="text-gray-600">Create your pre-scheduled group tour with fixed dates</p>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Basic Info</TabsTrigger>
              <TabsTrigger value="destinations">Destinations</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            
            <TabsContent value="info" className="m-0">
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageTitle">Package Title *</Label>
                    <ShadcnInput
                      id="packageTitle"
                      placeholder="e.g., 15-Day Incredible India Tour"
                      value={data.title || ''}
                      onChange={(e) => onChange({ title: e.target.value })}
                    />
                    <p className="text-sm text-gray-600">Create an attractive title for your fixed departure</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfDays">Number of Days *</Label>
                    <ShadcnInput
                      id="numberOfDays"
                      type="number"
                      placeholder="15"
                      value={data.days?.toString() || ''}
                      onChange={(e) => onChange({ days: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-sm text-gray-600">How many days does this tour last?</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packageDescription">Package Description</Label>
                    <ShadcnTextarea
                      id="packageDescription"
                      placeholder="Describe your fixed departure package, highlights, group size, etc..."
                      value={data.description || ''}
                      onChange={(e) => onChange({ description: e.target.value })}
                      rows={6}
                    />
                    <p className="text-sm text-gray-600">Describe what makes this departure special</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Package Image</Label>
                    <ImageUpload
                      onUpload={(file) => onChange({ image: file })}
                      preview={data.image}
                      label="Upload Package Image"
                    />
                  </div>
                </div>

                {/* Departure Dates Section */}
                <div className="pt-8 border-t border-gray-200">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Departure Dates</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">Set the specific dates when your fixed departure tours will run</p>
                        </div>
                        <Button
                          variant="default"
                          onClick={addDepartureDate}
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Date
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {departureDates.map((date, index) => (
                        <Card key={index} className="bg-red-50 border-red-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-gray-900">
                                  Departure Date {index + 1}
                                </span>
                              </div>
                              {departureDates.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDepartureDate(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <div className="mt-4">
                              <Label htmlFor={`departure-date-${index}`}>Select Departure Date</Label>
                              <div className="mt-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {date ? format(date, "PPP") : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={date}
                                      onSelect={(selectedDate) => {
                                        if (selectedDate) {
                                          updateDepartureDate(index, selectedDate);
                                        }
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {departureDates.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No departure dates added yet. Click &quot;Add Date&quot; to set tour dates.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="destinations" className="m-0">
              <motion.div
                key="destinations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tour Destinations</h3>
                <p className="text-gray-600">Add all destinations included in this fixed departure</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Destinations List</h4>
                  <Button
                    variant="default"
                    onClick={addDestination}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Destination
                  </Button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {(data.destinations || []).map((destination, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 items-center"
                      >
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <ShadcnInput
                          placeholder="Enter destination name"
                          value={destination}
                          onChange={(e) => updateDestination(index, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDestination(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!data.destinations || data.destinations.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No destinations added yet. Click &quot;Add Destination&quot; to start.</p>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="itinerary" className="m-0">
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                  <p className="text-gray-600 mt-1">Plan each day of your fixed departure</p>
                </div>
                <Button
                  variant="default"
                  onClick={addItineraryDay}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {(data.itinerary || []).map((day, index) => (
                    <Card key={index} className="bg-red-50 border-red-200">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {day.day}
                            </div>
                            <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = (data.itinerary || []).filter((_, i) => i !== index);
                              onChange({ itinerary: updated });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`day-title-${index}`}>Day Summary</Label>
                            <ShadcnInput
                              id={`day-title-${index}`}
                              placeholder="e.g., Arrival in Delhi - City Tour"
                              value={day.title}
                              onChange={(e) => updateItineraryDay(index, { title: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`day-description-${index}`}>Day Details</Label>
                            <ShadcnTextarea
                              id={`day-description-${index}`}
                              placeholder="Describe the day's activities, meals, accommodation, etc..."
                              value={day.description}
                              onChange={(e) => updateItineraryDay(index, { description: e.target.value })}
                              rows={4}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </AnimatePresence>

                {(!data.itinerary || data.itinerary.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No itinerary days added yet. Click &quot;Add Day&quot; to start planning.</p>
                  </div>
                )}
              </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="pricing" className="m-0">
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 p-8"
              >
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fixed Departure Pricing</h3>
                <p className="text-gray-600">Set pricing for your complete package with fixed dates</p>
              </div>
              
              <PricingSection
                pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                onChange={(pricing) => onChange({ pricing })}
              />
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Inner component that uses toast
function CompactPackageWizardContent({ onSuccess, onCancel }: CompactPackageWizardProps) {
  console.log('🚀 CompactPackageWizardContent component loaded');
  console.log('🚀 CompactPackageWizardContent: About to initialize hooks');
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({} as PackageFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  console.log('🚀 CompactPackageWizardContent: Hooks initialized, step:', step, 'selectedType:', selectedType);

  const handleTypeSelect = (type: PackageType) => {
    console.log('🚀 handleTypeSelect called with type:', type);
    setSelectedType(type);
    const baseFormData = {
      type, 
      inclusions: [],
      exclusions: [],
      tourInclusions: [],
      tourExclusions: [],
      destinations: [],
      itinerary: [],
      hotels: []
    };

    // Add type-specific initial data
    if (type === PackageType.TRANSFERS) {
      console.log('🚗 Setting up TRANSFERS form data');
      setFormData({
        ...baseFormData,
        vehicleConfigs: [{
          vehicleType: VehicleType.SEDAN,
          name: '',
          minPassengers: 1,
          maxPassengers: 4,
          basePrice: 0,
          features: [],
          isActive: true,
          orderIndex: 0,
          transferType: 'ONEWAY'
        }]
      });
    } else {
      console.log('📦 Setting up non-TRANSFERS form data');
      setFormData({
        ...baseFormData,
        pricing: [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]
      });
    }
    
    console.log('🚀 Moving to form step');
    setStep('form');
    addToast('Package type selected! Let\'s create your offering.', 'success');
  };

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user makes changes
    if (errors) {
      const newErrors = { ...errors };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    console.log('🔍 VALIDATION STARTED');
    console.log('📋 Form data being validated:', formData);
    console.log('📝 Package type:', formData.type);
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name && !formData.title) {
      console.error('❌ Validation failed: Name/Title is required');
      newErrors.name = 'Name/Title is required';
    }

    // Type-specific validation
    if (formData.type === PackageType.TRANSFERS) {
      console.log('🚗 Validating TRANSFER package...');
      
      if (!formData.place) {
        console.error('❌ Validation failed: Place is required');
        newErrors.place = 'Place is required';
      }
      if (!formData.from) {
        console.error('❌ Validation failed: Starting location is required');
        newErrors.from = 'Starting location is required';
      }
      if (!formData.to) {
        console.error('❌ Validation failed: Destination is required');
        newErrors.to = 'Destination is required';
      }
      if (!formData.transferType) {
        console.error('❌ Validation failed: Transfer type is required');
        newErrors.transferType = 'Transfer type is required';
      }
      if (!formData.vehicleConfigs || formData.vehicleConfigs.length === 0) {
        console.error('❌ Validation failed: At least one vehicle configuration is required');
        newErrors.vehicleConfigs = 'At least one vehicle configuration is required';
      } else {
        console.log('🚗 Validating vehicle configs:', formData.vehicleConfigs);
        // Validate each vehicle configuration
        formData.vehicleConfigs.forEach((config, index) => {
          if (!config.name) {
            console.error(`❌ Validation failed: Vehicle ${index} name is required`);
            newErrors[`vehicleConfigs.${index}.name`] = 'Vehicle service name is required';
          }
          if (!config.basePrice || config.basePrice <= 0) {
            newErrors[`vehicleConfigs.${index}.basePrice`] = 'Base price must be greater than 0';
          }
          if (config.minPassengers < 1) {
            newErrors[`vehicleConfigs.${index}.minPassengers`] = 'Minimum passengers must be at least 1';
          }
          if (config.maxPassengers < config.minPassengers) {
            newErrors[`vehicleConfigs.${index}.maxPassengers`] = 'Maximum passengers must be greater than or equal to minimum passengers';
          }
          if (!config.transferType) {
            newErrors[`vehicleConfigs.${index}.transferType`] = 'Transfer type is required for this vehicle';
          }
        });
      }
    }

    if (formData.type === PackageType.ACTIVITY) {
      if (!formData.place) newErrors.place = 'Destination is required';
      if (!formData.timing) newErrors.timing = 'Timing is required';
      if (!formData.durationHours) newErrors.duration = 'Duration is required';
    }

    if (formData.type === PackageType.FIXED_DEPARTURE_WITH_FLIGHT) {
      if (!formData.days) newErrors.days = 'Number of days is required';
      if (!formData.destinations || formData.destinations.length === 0) {
        newErrors.destinations = 'At least one destination is required';
      }
    }

    // Pricing validation - skip for transfer packages (they use vehicle configs)
    if (formData.type !== PackageType.TRANSFERS) {
      if (formData.type === PackageType.ACTIVITY) {
        // For activity packages, validate variants instead of pricing
        if (!formData.variants || formData.variants.length === 0) {
          console.error('❌ Validation failed: At least one package variant is required');
          newErrors.variants = 'At least one package variant is required';
        } else {
          formData.variants.forEach((variant, index) => {
            if (!variant.priceAdult || variant.priceAdult <= 0) {
              console.error(`❌ Validation failed: Adult price ${index} is required`);
              newErrors[`variants_${index}_adult`] = 'Adult price is required';
            }
            if (!variant.variantName) {
              console.error(`❌ Validation failed: Variant name ${index} is required`);
              newErrors[`variants_${index}_name`] = 'Variant name is required';
            }
          });
        }
      } else {
        // For other package types, use legacy pricing validation
      if (!formData.pricing || formData.pricing.length === 0) {
        console.error('❌ Validation failed: At least one pricing slab is required');
        newErrors.pricing = 'At least one pricing slab is required';
      } else {
        formData.pricing.forEach((price, index) => {
          if (!price.adultPrice || price.adultPrice <= 0) {
            console.error(`❌ Validation failed: Adult price ${index} is required`);
            newErrors[`pricing_${index}_adult`] = 'Adult price is required';
          }
          if (!price.validFrom) {
            console.error(`❌ Validation failed: Valid from date ${index} is required`);
            newErrors[`pricing_${index}_from`] = 'Valid from date is required';
          }
          if (!price.validTo) {
            console.error(`❌ Validation failed: Valid to date ${index} is required`);
            newErrors[`pricing_${index}_to`] = 'Valid to date is required';
          }
        });
        }
      }
    } else {
      console.log('🚗 Skipping pricing validation for transfer package (uses vehicle configs)');
    }

    console.log('🔍 Validation completed. Errors found:', Object.keys(newErrors).length);
    if (Object.keys(newErrors).length > 0) {
      console.error('❌ VALIDATION ERRORS:', newErrors);
    } else {
      console.log('✅ VALIDATION PASSED - No errors found');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE' = 'DRAFT') => {
    console.log('🚀🚀🚀 HANDLE SAVE FUNCTION CALLED 🚀🚀🚀');
    console.log('📊 Status:', status);
    console.log('📊 isSaving:', isSaving);
    console.log('📊 Form data keys:', Object.keys(formData));
    console.log('📊 Errors keys:', Object.keys(errors));
    console.log('🚗 Selected type:', selectedType);
    console.log('🚗 Is transfers package?', selectedType === PackageType.TRANSFERS);
    
    console.log('🚀 TRANSFER PACKAGE SUBMISSION STARTED');
    console.log('📋 Form validation check...');
    
    if (!validateForm()) {
      console.error('❌ FORM VALIDATION FAILED');
      console.log('🔍 Current form errors:', errors);
      console.log('📝 Form data that failed validation:', formData);
      addToast('Please fix the errors before saving', 'error');
      return;
    }

    console.log('✅ FORM VALIDATION PASSED');
    setIsSaving(true);
    
    try {
      console.log('🚀 Starting package save process...');
      console.log('📋 Form data:', formData);
      console.log('📝 Package status:', status);
      console.log('🔍 Package type:', formData.type);

      // 1) Get current user and tour_operator_id
      console.log('🔐 Getting current user...');
      const { data: authData } = await supabase.auth.getUser();
      const authUserId = authData.user?.id;
      console.log('👤 Auth user ID:', authUserId);
      if (!authUserId) throw new Error('Not authenticated');

      console.log('🏢 Ensuring tour operator profile exists for user:', authUserId);
      const { TourOperatorService } = await import('@/lib/services/tourOperatorService');
      const tourOperatorResult = await TourOperatorService.ensureTourOperatorProfile(authUserId);
      console.log('🏢 Tour operator ensure result:', tourOperatorResult);
      
      if (tourOperatorResult.error) {
        console.error('❌ Tour operator profile creation/lookup error:', tourOperatorResult.error);
        throw tourOperatorResult.error;
      }
      if (!tourOperatorResult.data?.id) {
        console.error('❌ Failed to create or find tour operator profile for user:', authUserId);
        throw new Error('Failed to create or find tour operator profile');
      }
      
      const tourOperator = tourOperatorResult.data;

      // 2) Insert main package
      console.log('📦 Preparing main package insert...');
      const mainInsert = {
        tour_operator_id: tourOperator.id,
        title: formData.title || formData.name || 'Untitled Package',
        description: formData.description || '',
        type: formData.type,
        // For transfer packages, use vehicle config pricing; for activities, use variants; for others, use legacy pricing
        adult_price: formData.type === 'TRANSFERS' 
          ? (formData.vehicleConfigs?.[0]?.basePrice ?? 0)
          : formData.type === 'ACTIVITY'
          ? (formData.variants?.[0]?.priceAdult ?? 0)
          : (formData.pricing?.[0]?.adultPrice ?? 0),
        child_price: formData.type === 'TRANSFERS' 
          ? 0 // Transfer packages don't have child pricing in legacy format
          : formData.type === 'ACTIVITY'
          ? (formData.variants?.[0]?.priceChild ?? 0)
          : (formData.pricing?.[0]?.childPrice ?? 0),
        duration_days: formData.days ?? 1,
        duration_hours: formData.durationHours ?? 0,
        status: status,
        // Transfer-specific fields
        transfer_service_type: formData.transferServiceType,
        distance_km: formData.distanceKm,
        estimated_duration: formData.estimatedDuration,
        advance_booking_hours: formData.advanceBookingHours,
        cancellation_policy_text: formData.cancellationPolicyText
      } as const;
      console.log('📦 Main insert data:', mainInsert);

      // Use enhanced service for transfer packages with vehicle configs
      if (formData.type === 'TRANSFERS' && formData.vehicleConfigs && formData.vehicleConfigs.length > 0) {
        console.log('🚗 Using enhanced transfer package creation with vehicle configs...');
        console.log('🚗 Vehicle configs:', formData.vehicleConfigs);
        console.log('🚗 Vehicle configs length:', formData.vehicleConfigs.length);
        
        const { data: pkgInsert, error: pkgErr } = await packageService.createTransferPackageWithVehicles(
          mainInsert, 
          formData.vehicleConfigs,
          formData.image as File
        );
        
        if (pkgErr) {
          console.error('❌ Transfer package creation error:', pkgErr);
          console.error('❌ Transfer package creation error details:', JSON.stringify(pkgErr, null, 2));
          throw pkgErr;
        }
        console.log('✅ Transfer package with vehicles created successfully:', pkgInsert);
      } else if (formData.type === 'ACTIVITY') {
        console.log('🎯 Using activity package creation service...');
        console.log('🎯 Activity variants:', formData.variants);
        
        const { ActivityPackageService } = await import('@/lib/services/ActivityPackageService');
        const result = await ActivityPackageService.createActivityPackage(
          tourOperator.id,
          formData as any,
          formData.image as File,
          status
        );
        
        if (!result.success) {
          console.error('❌ Activity package creation error:', result.error);
          throw new Error(result.error);
        }
        console.log('✅ Activity package created successfully:', result.packageId);
      } else {
        console.log('💾 Inserting main package...');
        const { data: pkgInsert, error: pkgErr } = await supabase
          .from('packages')
          .insert(mainInsert)
          .select('id')
          .single();
        
        console.log('💾 Package insert result:', { pkgInsert, error: pkgErr });
        if (pkgErr) throw pkgErr;
        const packageId = pkgInsert.id as string;

        if (!packageId) {
          throw new Error('Package was not created. No ID returned from database.');
        }
        console.log('✅ Package ID obtained:', packageId);

        // Upload and save image if provided
        const imageFile = formData.image || formData.banner;
        if (imageFile && imageFile instanceof File) {
          console.log('📸 Uploading package image...');
          const { ImageService } = await import('@/lib/services/imageService');
          const imageResult = await ImageService.uploadAndSavePackageImage(
            imageFile, 
            packageId, 
            true, // isPrimary
            0 // order
          );
          
          if (!imageResult.success) {
            console.warn('⚠️ Image upload failed, but package was created:', imageResult.error);
          } else {
            console.log('✅ Package image uploaded successfully:', imageResult.url);
          }
        }

        // Verify insert exists (defensive check vs RLS or triggers)
        console.log('🔍 Verifying package exists...');
        const { data: verifyPkg, error: verifyErr } = await supabase
          .from('packages')
          .select('id')
          .eq('id', packageId)
          .maybeSingle();
        console.log('🔍 Verification result:', { verifyPkg, error: verifyErr });
        if (verifyErr) throw verifyErr;
        if (!verifyPkg?.id) {
          throw new Error('Package creation verification failed. Check RLS permissions and schema.');
        }

        // Continue with the rest of your save logic...
      }
      
      const successMessage = status === 'ACTIVE' 
        ? 'Package created and published successfully!' 
        : 'Package saved as draft successfully!';
      addToast(successMessage, 'success');
      
      // Use onSuccess callback if provided, otherwise use router
      if (onSuccess && verifyPkg?.id) {
        onSuccess(verifyPkg.id);
      } else {
        router.push('/operator/packages');
      }
      
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in package save:', error);
      console.error('🔍 Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack,
        formData: formData,
        status: status,
        type: formData.type
      });
      
      // Check if it's a specific database error
      if (error?.code) {
        console.error('🗄️ Database error code:', error.code);
        if (error.code === '23505') {
          console.error('🔑 Unique constraint violation - duplicate key');
        } else if (error.code === '23503') {
          console.error('🔗 Foreign key constraint violation');
        } else if (error.code === '42501') {
          console.error('🔒 Permission denied - RLS policy issue');
        }
      }
      
      addToast(error?.message || 'Error saving package. Please try again.', 'error');
    } finally {
      console.log('🏁 Package save process completed');
      setIsSaving(false);
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case PackageType.TRANSFERS:
        return <TransferForm data={formData} onChange={updateFormData} errors={errors} />;
      case PackageType.ACTIVITY:
        return <ActivityPackageForm data={formData} onChange={updateFormData} errors={errors} />;
      case PackageType.MULTI_CITY_PACKAGE:
        return <MultiCityPackageForm data={formData} onChange={updateFormData} />;
      case PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL:
        return <MultiCityPackageWithHotelForm data={formData} onChange={updateFormData} />;
      case PackageType.FIXED_DEPARTURE_WITH_FLIGHT:
        return <FixedDepartureForm data={formData} onChange={updateFormData} />;
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Form for {selectedType} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 relative z-10"
            >
              <PackageTypeSelector onSelect={handleTypeSelect} />
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 relative z-10"
            >
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Improved Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-4"
                >
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (onCancel) {
                        onCancel();
                      } else {
                        setStep('type');
                        addToast('Returning to package selection', 'info');
                      }
                    }}
                    className="group flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    <span className="font-medium text-sm">Back</span>
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <AnimatePresence>
                      {Object.keys(errors).length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} to fix
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex gap-3">
                      {/* Save Draft Button */}
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖱️ SAVE DRAFT BUTTON CLICKED');
                          console.log('📋 Current form data:', formData);
                          console.log('🔍 Current errors:', errors);
                          console.log('🔍 Button disabled?', isSaving);
                          handleSave('DRAFT');
                        }}
                        disabled={isSaving}
                        className="relative flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="font-medium">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span className="font-medium">Save Draft</span>
                          </>
                        )}
                      </Button>

                      {/* Submit/Publish Button */}
                      <Button
                        variant="default"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖱️ SUBMIT & PUBLISH BUTTON CLICKED');
                          console.log('📋 Current form data:', formData);
                          console.log('🔍 Current errors:', errors);
                          console.log('🔍 Button disabled?', isSaving);
                          handleSave('ACTIVE');
                        }}
                        disabled={isSaving}
                        className="relative flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="font-medium">Publishing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Submit & Publish</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {renderForm()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

// Vehicle Configuration Section Component
const VehicleConfigurationSection = ({ 
  vehicleConfigs, 
  onChange 
}: { 
  vehicleConfigs: VehicleConfig[]; 
  onChange: (configs: VehicleConfig[]) => void; 
}) => {
  const [customVehicleTypes, setCustomVehicleTypes] = useState<Record<number, string>>({});
  const [showCustomInputs, setShowCustomInputs] = useState<Record<number, boolean>>({});

  const vehicleTypeOptions = [
    { value: VehicleType.SEDAN, label: 'Sedan', icon: Car },
    { value: VehicleType.SUV, label: 'SUV', icon: Car },
    { value: VehicleType.LUXURY_SEDAN, label: 'Luxury Sedan', icon: Car },
    { value: VehicleType.TEMPO_TRAVELLER, label: 'Tempo Traveller', icon: Car },
    { value: VehicleType.BUS, label: 'Bus', icon: Car },
    { value: VehicleType.CUSTOM, label: 'Custom Type', icon: Settings },
  ];

  const availableFeatures = [
    { id: 'AC', label: 'Air Conditioning', icon: Settings },
    { id: 'WIFI', label: 'WiFi', icon: Wifi },
    { id: 'MUSIC', label: 'Music System', icon: Music },
    { id: 'REFRESHMENTS', label: 'Refreshments', icon: Coffee },
    { id: 'LUGGAGE', label: 'Luggage Assistance', icon: Luggage },
    { id: 'CHILD_SEAT', label: 'Child Seat', icon: Users },
  ];

  const addVehicleConfig = () => {
    const newConfig: VehicleConfig = {
      vehicleType: VehicleType.SEDAN,
      name: '',
      minPassengers: 1,
      maxPassengers: 4,
      basePrice: 0,
      features: [],
      isActive: true,
      orderIndex: vehicleConfigs.length,
      transferType: 'ONEWAY',
    };
    onChange([...vehicleConfigs, newConfig]);
    // Clear custom input state for new vehicle
    setCustomVehicleTypes(prev => ({ ...prev, [vehicleConfigs.length]: '' }));
    setShowCustomInputs(prev => ({ ...prev, [vehicleConfigs.length]: false }));
  };

  const updateVehicleConfig = (index: number, field: keyof VehicleConfig, value: any) => {
    const updated = [...vehicleConfigs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVehicleConfig = (index: number) => {
    onChange(vehicleConfigs.filter((_, i) => i !== index));
    // Clean up custom input state for removed vehicle
    setCustomVehicleTypes(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setShowCustomInputs(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const toggleFeature = (configIndex: number, featureId: string) => {
    const config = vehicleConfigs[configIndex];
    const updatedFeatures = config.features.includes(featureId)
      ? config.features.filter(f => f !== featureId)
      : [...config.features, featureId];
    updateVehicleConfig(configIndex, 'features', updatedFeatures);
  };

  const handleVehicleTypeChange = (configIndex: number, value: string) => {
    if (value === VehicleType.CUSTOM) {
      setShowCustomInputs(prev => ({ ...prev, [configIndex]: true }));
    } else {
      setShowCustomInputs(prev => ({ ...prev, [configIndex]: false }));
      updateVehicleConfig(configIndex, 'vehicleType', value);
    }
  };

  const handleCustomVehicleType = (configIndex: number) => {
    const customType = customVehicleTypes[configIndex];
    if (customType?.trim()) {
      updateVehicleConfig(configIndex, 'vehicleType', customType.trim());
      setCustomVehicleTypes(prev => ({ ...prev, [configIndex]: '' }));
      setShowCustomInputs(prev => ({ ...prev, [configIndex]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vehicle Configurations</CardTitle>
            <p className="text-sm text-gray-600">Add different vehicle options for your transfer service</p>
          </div>
          <Button
            type="button"
            variant="default"
            onClick={addVehicleConfig}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {vehicleConfigs.map((config, index) => (
          <Card key={index} className="bg-gray-50">
            <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Vehicle {index + 1}</h4>
              {vehicleConfigs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVehicleConfig(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Main vehicle details in a clean grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label>Vehicle Type *</Label>
                <div className="space-y-2">
                  <Select
                    value={config.vehicleType}
                    onChange={(value) => handleVehicleTypeChange(index, value)}
                    options={vehicleTypeOptions}
                    placeholder="Select type"
                  />
                  {showCustomInputs[index] && (
                    <div className="flex gap-2">
                      <ShadcnInput
                        placeholder="Enter custom type"
                        value={customVehicleTypes[index] || ''}
                        onChange={(e) => setCustomVehicleTypes(prev => ({ ...prev, [index]: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleCustomVehicleType(index)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Name */}
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <ShadcnInput
                  placeholder="e.g., Economy Sedan Transfer"
                  value={config.name}
                  onChange={(e) => updateVehicleConfig(index, 'name', e.target.value)}
                />
              </div>

              {/* Passenger Capacity */}
              <div className="space-y-2">
                <Label>Passenger Capacity *</Label>
                <div className="flex gap-2">
                  <ShadcnInput
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Min"
                    value={config.minPassengers.toString()}
                    onChange={(e) => updateVehicleConfig(index, 'minPassengers', parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <span className="flex items-center text-gray-500 font-medium">to</span>
                  <ShadcnInput
                    type="number"
                    min={config.minPassengers}
                    max="50"
                    placeholder="Max"
                    value={config.maxPassengers.toString()}
                    onChange={(e) => updateVehicleConfig(index, 'maxPassengers', parseInt(e.target.value) || config.minPassengers)}
                    className="text-center"
                  />
                </div>
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <Label>Base Price (₹) *</Label>
                <ShadcnInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={config.basePrice.toString()}
                  onChange={(e) => updateVehicleConfig(index, 'basePrice', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Per KM Rate */}
              <div className="space-y-2">
                <Label>Per KM Rate (₹)</Label>
                <ShadcnInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={config.perKmRate?.toString() || ''}
                  onChange={(e) => updateVehicleConfig(index, 'perKmRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <p className="text-sm text-gray-600">Optional</p>
              </div>

              {/* Transfer Type for this vehicle */}
              <div className="space-y-2">
                <Label>Transfer Type *</Label>
                <RadioGroup 
                  value={config.transferType} 
                  onValueChange={(value) => updateVehicleConfig(index, 'transferType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ONEWAY" id={`oneway-${index}`} />
                    <Label htmlFor={`oneway-${index}`}>One Way</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TWOWAY" id={`twoway-${index}`} />
                    <Label htmlFor={`twoway-${index}`}>Two Way</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Vehicle Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map((feature) => (
                  <label
                    key={feature.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={config.features.includes(feature.id)}
                      onChange={() => toggleFeature(index, feature.id)}
                      className="rounded border-gray-300"
                    />
                    <feature.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <ShadcnTextarea
                placeholder="Describe this vehicle option..."
                value={config.description || ''}
                onChange={(e) => updateVehicleConfig(index, 'description', e.target.value)}
                rows={2}
              />
            </div>
            </CardContent>
          </Card>
        ))}

        {vehicleConfigs.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No vehicle configurations added yet</p>
            <p className="text-sm">Click &quot;Add Vehicle&quot; to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Props interface for the wizard
interface CompactPackageWizardProps {
  onSuccess?: (packageId: string) => void;
  onCancel?: () => void;
}

// Main wizard component with ToastProvider wrapper
export default function CompactPackageWizard({ onSuccess, onCancel }: CompactPackageWizardProps) {
  console.log('🚀🚀🚀 COMPACT PACKAGE WIZARD LOADED 🚀🚀🚀');
  console.log('🚀🚀🚀 THIS SHOULD APPEAR IN CONSOLE 🚀🚀🚀');
  
  return (
    <ToastProvider>
      <CompactPackageWizardContent onSuccess={onSuccess} onCancel={onCancel} />
    </ToastProvider>
  );
}