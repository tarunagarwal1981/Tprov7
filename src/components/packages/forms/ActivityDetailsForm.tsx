'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Clock, MapPin, Phone, Globe } from 'lucide-react';
import { ActivityCategory, DayOfWeek, TransferOption, OperationalHours, EmergencyContact } from '@/lib/types';

interface ActivityDetailsFormProps {
  formData: {
    activityCategory?: string;
    availableDays?: string[];
    operationalHours?: OperationalHours;
    meetingPoint?: string;
    emergencyContact?: EmergencyContact;
    transferOptions?: string[];
    maxCapacity?: number;
    languagesSupported?: string[];
  };
  onChange: (updates: any) => void;
  errors?: Record<string, string[]>;
}

// Custom FormField component matching the app's style
const FormField = ({ label, required = false, children, error, description }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center text-red-600 text-xs">
        <span className="w-3 h-3 mr-1 flex-shrink-0">⚠</span>
        {error}
      </div>
    )}
  </div>
);

// Custom Input component matching the app's style
const CustomInput = ({ placeholder, value, onChange, type = "text", error, ...props }: any) => (
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
        ? '0 4px 12px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
    }}
    {...props}
  />
);

// Custom Textarea component matching the app's style
const CustomTextarea = ({ placeholder, value, onChange, rows = 4, error, ...props }: any) => (
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
        ? '0 4px 12px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
    }}
    {...props}
  />
);

// Custom Button component matching the app's style
const CustomButton = ({ children, onClick, variant = "primary", size = "md", ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500",
    outline: "border border-white/40 bg-white/20 hover:bg-white/30 text-gray-700 focus:ring-blue-500",
    ghost: "hover:bg-white/20 text-gray-600 focus:ring-blue-500"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm rounded-xl",
    md: "px-4 py-3 text-sm rounded-2xl",
    lg: "px-6 py-4 text-base rounded-2xl"
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const ActivityDetailsForm: React.FC<ActivityDetailsFormProps> = ({
  formData,
  onChange,
  errors = {}
}) => {
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const activityCategories = Object.values(ActivityCategory);
  const daysOfWeek = Object.values(DayOfWeek);
  const transferOptions = Object.values(TransferOption);
  const languages = ['English', 'Arabic', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Hindi'];

  const handleOperationalHoursChange = (field: string, value: any) => {
    onChange({
      operationalHours: {
        ...formData.operationalHours,
        [field]: value
      }
    });
  };

  const handleEmergencyContactChange = (field: string, value: any) => {
    onChange({
      emergencyContact: {
        ...formData.emergencyContact,
        [field]: value
      }
    });
  };

  const toggleArrayField = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onChange({ [field]: newArray });
  };

  const addTimeSlot = () => {
    const currentSlots = formData.operationalHours?.timeSlots || [];
    const newSlot = {
      id: `slot-${Date.now()}`,
      startTime: '09:00',
      endTime: '10:00',
      maxCapacity: formData.maxCapacity || 20,
      isActive: true
    };
    
    handleOperationalHoursChange('timeSlots', [...currentSlots, newSlot]);
  };

  const updateTimeSlot = (slotId: string, field: string, value: any) => {
    const currentSlots = formData.operationalHours?.timeSlots || [];
    const updatedSlots = currentSlots.map(slot =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    );
    
    handleOperationalHoursChange('timeSlots', updatedSlots);
  };

  const removeTimeSlot = (slotId: string) => {
    const currentSlots = formData.operationalHours?.timeSlots || [];
    const updatedSlots = currentSlots.filter(slot => slot.id !== slotId);
    
    handleOperationalHoursChange('timeSlots', updatedSlots);
  };

  return (
    <div className="space-y-6">
      {/* Activity Category */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30">
            <span className="text-blue-600 font-medium text-sm">Activity Type</span>
          </div>
        </div>
        <FormField 
          label="Activity Category" 
          required
          description="Select the type of activity you're offering"
          error={errors.activityCategory?.[0]}
        >
          <select
            value={formData.activityCategory || ''}
            onChange={(e) => onChange({ activityCategory: e.target.value })}
            className="w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md bg-white/30 hover:bg-white/50 focus:bg-white/60"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <option value="">Select activity category</option>
            {activityCategories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Available Days */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-600 font-medium text-sm">Available Days</span>
        </div>
        <FormField 
          label="Select days when this activity operates"
          error={errors.availableDays?.[0]}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={day}
                  checked={formData.availableDays?.includes(day) || false}
                  onChange={() => toggleArrayField('availableDays', day)}
                  className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor={day} className="text-sm font-medium text-gray-700">
                  {day.slice(0, 3)}
                </label>
              </div>
            ))}
          </div>
        </FormField>
      </div>

      {/* Operational Hours */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-green-600" />
          <span className="text-green-600 font-medium text-sm">Operational Hours</span>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Start Time">
              <CustomInput
                type="time"
                value={formData.operationalHours?.startTime || ''}
                onChange={(value) => handleOperationalHoursChange('startTime', value)}
              />
            </FormField>
            <FormField label="End Time">
              <CustomInput
                type="time"
                value={formData.operationalHours?.endTime || ''}
                onChange={(value) => handleOperationalHoursChange('endTime', value)}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormField label="Time Slots (Optional)">
                <p className="text-xs text-gray-500">Define specific time slots for bookings</p>
              </FormField>
            </div>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setShowTimeSlots(!showTimeSlots)}
            >
              {showTimeSlots ? 'Hide' : 'Show'} Time Slots
            </CustomButton>
          </div>

          {showTimeSlots && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {formData.operationalHours?.timeSlots?.map((slot) => (
                <div key={slot.id} className="flex items-center gap-4 p-4 border border-white/20 rounded-2xl backdrop-blur-md bg-white/20">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <CustomInput
                        type="time"
                        value={slot.startTime}
                        onChange={(value) => updateTimeSlot(slot.id, 'startTime', value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <CustomInput
                        type="time"
                        value={slot.endTime}
                        onChange={(value) => updateTimeSlot(slot.id, 'endTime', value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Capacity</label>
                      <CustomInput
                        type="number"
                        value={slot.maxCapacity || ''}
                        onChange={(value) => updateTimeSlot(slot.id, 'maxCapacity', parseInt(value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={slot.isActive}
                        onChange={(e) => updateTimeSlot(slot.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label className="text-xs text-gray-600">Active</label>
                    </div>
                  </div>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeSlot(slot.id)}
                  >
                    <X className="h-4 w-4" />
                  </CustomButton>
                </div>
              ))}
              
              <CustomButton
                variant="outline"
                onClick={addTimeSlot}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </CustomButton>
            </motion.div>
          )}
        </div>
      </div>

      {/* Meeting Point */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-purple-600" />
          <span className="text-purple-600 font-medium text-sm">Meeting Point</span>
        </div>
        <FormField 
          label="Meeting/Reporting Point" 
          required
          description="Where customers should meet for the activity"
          error={errors.meetingPoint?.[0]}
        >
          <CustomInput
            placeholder="e.g., Hotel Lobby, Main Entrance, Specific Address"
            value={formData.meetingPoint || ''}
            onChange={(value) => onChange({ meetingPoint: value })}
          />
        </FormField>
      </div>

      {/* Emergency Contact */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-red-600" />
          <span className="text-red-600 font-medium text-sm">Emergency Contact</span>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <CustomInput
                placeholder="Emergency contact name"
                value={formData.emergencyContact?.name || ''}
                onChange={(value) => handleEmergencyContactChange('name', value)}
              />
            </FormField>
            <FormField label="Phone Number">
              <CustomInput
                placeholder="+1 234 567 8900"
                value={formData.emergencyContact?.phone || ''}
                onChange={(value) => handleEmergencyContactChange('phone', value)}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email">
              <CustomInput
                type="email"
                placeholder="emergency@company.com"
                value={formData.emergencyContact?.email || ''}
                onChange={(value) => handleEmergencyContactChange('email', value)}
              />
            </FormField>
            <FormField label="Available Hours">
              <CustomInput
                placeholder="24/7 or 9 AM - 6 PM"
                value={formData.emergencyContact?.availableHours || ''}
                onChange={(value) => handleEmergencyContactChange('availableHours', value)}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Transfer Options */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-orange-600" />
          <span className="text-orange-600 font-medium text-sm">Transfer Options</span>
        </div>
        <FormField 
          label="Available Transfer Options"
          error={errors.transferOptions?.[0]}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {transferOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={formData.transferOptions?.includes(option) || false}
                  onChange={() => toggleArrayField('transferOptions', option)}
                  className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor={option} className="text-sm font-medium text-gray-700">
                  {option.replace(/_/g, ' ')}
                </label>
              </div>
            ))}
          </div>
        </FormField>
      </div>

      {/* Capacity & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600 font-medium text-sm">Capacity</span>
          </div>
          <FormField 
            label="Maximum Capacity per Slot"
            error={errors.maxCapacity?.[0]}
          >
            <CustomInput
              type="number"
              placeholder="e.g., 20"
              value={formData.maxCapacity || ''}
              onChange={(value) => onChange({ maxCapacity: parseInt(value) || undefined })}
            />
          </FormField>
        </div>

        <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600 font-medium text-sm">Languages Supported</span>
          </div>
          <FormField 
            label="Select supported languages"
            error={errors.languagesSupported?.[0]}
          >
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {languages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={language}
                    checked={formData.languagesSupported?.includes(language) || false}
                    onChange={() => toggleArrayField('languagesSupported', language)}
                    className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor={language} className="text-sm text-gray-700">
                    {language}
                  </label>
                </div>
              ))}
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsForm;
