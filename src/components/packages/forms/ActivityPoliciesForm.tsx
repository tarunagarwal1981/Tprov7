'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit, Trash2, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { FAQ, AgeRestrictions } from '@/lib/types';

interface ActivityPoliciesFormProps {
  formData: {
    importantInfo?: string;
    faq?: FAQ[];
    ageRestrictionsDetailed?: AgeRestrictions;
    accessibilityInfo?: string[];
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
const CustomButton = ({ children, onClick, variant = "primary", size = "md", className = "", ...props }: any) => {
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
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const ActivityPoliciesForm: React.FC<ActivityPoliciesFormProps> = ({
  formData,
  onChange,
  errors = {}
}) => {
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null);

  const handleAgeRestrictionsChange = (field: string, value: any) => {
    onChange({
      ageRestrictionsDetailed: {
        ...formData.ageRestrictionsDetailed,
        [field]: value
      }
    });
  };

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      category: 'General',
      order: (formData.faq?.length || 0)
    };
    
    onChange({
      faq: [...(formData.faq || []), newFAQ]
    });
    setEditingFAQ(newFAQ.id);
  };

  const updateFAQ = (faqId: string, field: string, value: any) => {
    const updatedFAQs = (formData.faq || []).map(faq =>
      faq.id === faqId ? { ...faq, [field]: value } : faq
    );
    onChange({ faq: updatedFAQs });
  };

  const removeFAQ = (faqId: string) => {
    const updatedFAQs = (formData.faq || []).filter(faq => faq.id !== faqId);
    onChange({ faq: updatedFAQs });
  };

  const moveFAQ = (faqId: string, direction: 'up' | 'down') => {
    const currentFAQs = formData.faq || [];
    const currentIndex = currentFAQs.findIndex(f => f.id === faqId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentFAQs.length) return;

    const updatedFAQs = [...currentFAQs];
    [updatedFAQs[currentIndex], updatedFAQs[newIndex]] = 
    [updatedFAQs[newIndex], updatedFAQs[currentIndex]];
    
    // Update order indices
    updatedFAQs.forEach((faq, index) => {
      faq.order = index;
    });
    
    onChange({ faq: updatedFAQs });
  };

  const toggleAccessibilityInfo = (item: string) => {
    const currentItems = formData.accessibilityInfo || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    onChange({ accessibilityInfo: newItems });
  };

  const addCustomAccessibilityInfo = () => {
    const customItem = prompt('Enter custom accessibility information:');
    if (customItem && customItem.trim()) {
      const currentItems = formData.accessibilityInfo || [];
      onChange({ accessibilityInfo: [...currentItems, customItem.trim()] });
    }
  };

  const removeAccessibilityInfo = (item: string) => {
    const currentItems = formData.accessibilityInfo || [];
    onChange({ accessibilityInfo: currentItems.filter(i => i !== item) });
  };

  const predefinedAccessibilityItems = [
    'Wheelchair accessible',
    'Elevator available',
    'Accessible restrooms',
    'Audio guides available',
    'Sign language interpreter available',
    'Braille materials available',
    'Assistance for visually impaired',
    'Assistance for hearing impaired',
    'Stroller friendly',
    'Senior friendly'
  ];

  const faqCategories = ['General', 'Booking', 'Cancellation', 'Accessibility', 'Safety', 'Pricing', 'Other'];

  return (
    <div className="space-y-6">
      {/* Important Information */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <span className="text-blue-600 font-medium text-sm">Important Information</span>
        </div>
        <FormField 
          label="Important Information for Customers" 
          required
          description="Include important details like ID requirements, dress code, weather dependency, special rules, etc."
          error={errors.importantInfo?.[0]}
        >
          <CustomTextarea
            placeholder="Include important details like ID requirements, dress code, weather dependency, special rules, etc."
            value={formData.importantInfo || ''}
            onChange={(value) => onChange({ importantInfo: value })}
            rows={6}
          />
        </FormField>
      </div>

      {/* Age Restrictions */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-600 font-medium text-sm">Age Restrictions & Policies</span>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Minimum Age">
              <CustomInput
                type="number"
                placeholder="e.g., 5"
                value={formData.ageRestrictionsDetailed?.minAge || ''}
                onChange={(value) => handleAgeRestrictionsChange('minAge', parseInt(value) || undefined)}
              />
            </FormField>
            <FormField label="Maximum Age">
              <CustomInput
                type="number"
                placeholder="Leave empty for no limit"
                value={formData.ageRestrictionsDetailed?.maxAge || ''}
                onChange={(value) => handleAgeRestrictionsChange('maxAge', parseInt(value) || undefined)}
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <FormField label="Child Policy" required>
              <CustomTextarea
                placeholder="Define child age ranges and pricing policies..."
                value={formData.ageRestrictionsDetailed?.childPolicy || ''}
                onChange={(value) => handleAgeRestrictionsChange('childPolicy', value)}
                rows={3}
              />
            </FormField>
            <FormField label="Infant Policy">
              <CustomTextarea
                placeholder="Define infant age ranges and policies..."
                value={formData.ageRestrictionsDetailed?.infantPolicy || ''}
                onChange={(value) => handleAgeRestrictionsChange('infantPolicy', value)}
                rows={3}
              />
            </FormField>
            <FormField label="Senior Citizen Policy">
              <CustomTextarea
                placeholder="Define senior citizen age ranges and discounts..."
                value={formData.ageRestrictionsDetailed?.seniorPolicy || ''}
                onChange={(value) => handleAgeRestrictionsChange('seniorPolicy', value)}
                rows={3}
              />
            </FormField>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ageVerificationRequired"
              checked={formData.ageRestrictionsDetailed?.ageVerificationRequired || false}
              onChange={(e) => handleAgeRestrictionsChange('ageVerificationRequired', e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="ageVerificationRequired" className="text-sm font-medium text-gray-700">
              Age verification required (ID check)
            </label>
          </div>
        </div>
      </div>

      {/* Accessibility Information */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-600 font-medium text-sm">Accessibility Information</span>
        </div>
        <div className="space-y-4">
          <FormField label="Select accessibility features available">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedAccessibilityItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={item}
                    checked={formData.accessibilityInfo?.includes(item) || false}
                    onChange={() => toggleAccessibilityInfo(item)}
                    className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor={item} className="text-sm font-medium text-gray-700">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </FormField>

          {/* Custom accessibility items */}
          {formData.accessibilityInfo && formData.accessibilityInfo.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Custom Accessibility Information</label>
              <div className="space-y-2">
                {formData.accessibilityInfo
                  .filter(item => !predefinedAccessibilityItems.includes(item))
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CustomInput value={item} readOnly />
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccessibilityInfo(item)}
                      >
                        <X className="h-4 w-4" />
                      </CustomButton>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <CustomButton
            variant="outline"
            onClick={addCustomAccessibilityInfo}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Accessibility Information
          </CustomButton>
        </div>
      </div>

      {/* FAQ Management */}
      <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium text-sm">Frequently Asked Questions</span>
          </div>
          <CustomButton onClick={addFAQ} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add FAQ
          </CustomButton>
        </div>
        <div className="space-y-4">
          <AnimatePresence>
            {(formData.faq || []).map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`backdrop-blur-md rounded-2xl border p-4 ${
                  editingFAQ === faq.id ? 'border-emerald-400/70 ring-2 ring-emerald-400/20' : 'border-white/20'
                }`}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-50/50 backdrop-blur-sm rounded-lg border border-emerald-200/30">
                        <span className="text-emerald-600 font-medium text-xs">#{index + 1}</span>
                      </div>
                      <h5 className="text-base font-semibold text-gray-900">
                        {faq.question || 'Untitled Question'}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFAQ(faq.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </CustomButton>
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFAQ(faq.id, 'down')}
                        disabled={index === (formData.faq?.length || 0) - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </CustomButton>
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFAQ(
                          editingFAQ === faq.id ? null : faq.id
                        )}
                      >
                        <Edit className="h-4 w-4" />
                      </CustomButton>
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQ(faq.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </CustomButton>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editingFAQ === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <FormField label="Question" required>
                          <CustomInput
                            placeholder="What is your question?"
                            value={faq.question}
                            onChange={(value) => updateFAQ(faq.id, 'question', value)}
                          />
                        </FormField>
                        <FormField label="Answer" required>
                          <CustomTextarea
                            placeholder="Provide a clear and helpful answer..."
                            value={faq.answer}
                            onChange={(value) => updateFAQ(faq.id, 'answer', value)}
                            rows={4}
                          />
                        </FormField>
                        <FormField label="Category">
                          <select
                            className="w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md bg-white/30 hover:bg-white/50 focus:bg-white/60"
                            style={{
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                            value={faq.category || 'General'}
                            onChange={(e) => updateFAQ(faq.id, 'category', e.target.value)}
                          >
                            {faqCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Summary View */}
                  {editingFAQ !== faq.id && (
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-gray-900">{faq.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                          {faq.category}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(!formData.faq || formData.faq.length === 0) && (
            <div className="backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center"
              style={{
                background: 'rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No FAQs yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Add common questions and answers to help customers
                </p>
                <CustomButton onClick={addFAQ} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First FAQ
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPoliciesForm;
