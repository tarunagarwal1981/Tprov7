'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { PackageVariant } from '@/lib/types';

interface PackageVariantsFormProps {
  variants: PackageVariant[];
  onChange: (variants: PackageVariant[]) => void;
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

const PackageVariantsForm: React.FC<PackageVariantsFormProps> = ({
  variants = [],
  onChange,
  errors = {}
}) => {
  const [editingVariant, setEditingVariant] = useState<string | null>(null);

  const addVariant = () => {
    const newVariant: PackageVariant = {
      id: `variant-${Date.now()}`,
      packageId: '',
      variantName: '',
      description: '',
      inclusions: [],
      exclusions: [],
      priceAdult: 0,
      priceChild: 0,
      priceInfant: 0,
      minGuests: 1,
      maxGuests: undefined,
      isActive: true,
      orderIndex: variants.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onChange([...variants, newVariant]);
    setEditingVariant(newVariant.id);
  };

  const updateVariant = (variantId: string, field: string, value: any) => {
    const updatedVariants = variants.map(variant =>
      variant.id === variantId ? { ...variant, [field]: value, updatedAt: new Date() } : variant
    );
    onChange(updatedVariants);
  };

  const removeVariant = (variantId: string) => {
    const updatedVariants = variants.filter(variant => variant.id !== variantId);
    onChange(updatedVariants);
  };

  const duplicateVariant = (variantId: string) => {
    const variantToDuplicate = variants.find(v => v.id === variantId);
    if (variantToDuplicate) {
      const duplicatedVariant: PackageVariant = {
        ...variantToDuplicate,
        id: `variant-${Date.now()}`,
        variantName: `${variantToDuplicate.variantName} (Copy)`,
        orderIndex: variants.length,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onChange([...variants, duplicatedVariant]);
    }
  };

  const moveVariant = (variantId: string, direction: 'up' | 'down') => {
    const currentIndex = variants.findIndex(v => v.id === variantId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= variants.length) return;

    const updatedVariants = [...variants];
    [updatedVariants[currentIndex], updatedVariants[newIndex]] = 
    [updatedVariants[newIndex], updatedVariants[currentIndex]];
    
    // Update order indices
    updatedVariants.forEach((variant, index) => {
      variant.orderIndex = index;
    });
    
    onChange(updatedVariants);
  };

  const addInclusion = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      updateVariant(variantId, 'inclusions', [...variant.inclusions, '']);
    }
  };

  const updateInclusion = (variantId: string, index: number, value: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const updatedInclusions = [...variant.inclusions];
      updatedInclusions[index] = value;
      updateVariant(variantId, 'inclusions', updatedInclusions);
    }
  };

  const removeInclusion = (variantId: string, index: number) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const updatedInclusions = variant.inclusions.filter((_, i) => i !== index);
      updateVariant(variantId, 'inclusions', updatedInclusions);
    }
  };

  const addExclusion = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      updateVariant(variantId, 'exclusions', [...variant.exclusions, '']);
    }
  };

  const updateExclusion = (variantId: string, index: number, value: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const updatedExclusions = [...variant.exclusions];
      updatedExclusions[index] = value;
      updateVariant(variantId, 'exclusions', updatedExclusions);
    }
  };

  const removeExclusion = (variantId: string, index: number) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const updatedExclusions = variant.exclusions.filter((_, i) => i !== index);
      updateVariant(variantId, 'exclusions', updatedExclusions);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Package Variants</h3>
          <p className="text-sm text-gray-600">
            Create different ticket/package options (e.g., General Admission, VIP Experience)
          </p>
        </div>
        <CustomButton onClick={addVariant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </CustomButton>
      </div>

      <AnimatePresence>
        {variants.map((variant, index) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`backdrop-blur-xl rounded-2xl border p-6 ${
              editingVariant === variant.id ? 'border-emerald-400/70 ring-2 ring-emerald-400/20' : 'border-white/20'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/50 backdrop-blur-sm rounded-xl border border-emerald-200/30">
                    <span className="text-emerald-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {variant.variantName || 'Untitled Variant'}
                  </h4>
                  <div className="flex items-center gap-1">
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => moveVariant(variant.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </CustomButton>
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => moveVariant(variant.id, 'down')}
                      disabled={index === variants.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </CustomButton>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingVariant(
                      editingVariant === variant.id ? null : variant.id
                    )}
                  >
                    <Edit className="h-4 w-4" />
                  </CustomButton>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateVariant(variant.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </CustomButton>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </CustomButton>
                </div>
              </div>

              <AnimatePresence>
                {editingVariant === variant.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Variant Name" required>
                        <CustomInput
                          placeholder="e.g., General Admission, VIP Experience"
                          value={variant.variantName}
                          onChange={(value) => updateVariant(variant.id, 'variantName', value)}
                        />
                      </FormField>
                      <FormField label="Description">
                        <CustomInput
                          placeholder="Brief description of this variant"
                          value={variant.description || ''}
                          onChange={(value) => updateVariant(variant.id, 'description', value)}
                        />
                      </FormField>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h5 className="font-medium mb-3 text-gray-900">Pricing</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Adult Price" required>
                          <CustomInput
                            type="number"
                            placeholder="0.00"
                            value={variant.priceAdult || ''}
                            onChange={(value) => updateVariant(variant.id, 'priceAdult', parseFloat(value) || 0)}
                          />
                        </FormField>
                        <FormField label="Child Price">
                          <CustomInput
                            type="number"
                            placeholder="0.00"
                            value={variant.priceChild || ''}
                            onChange={(value) => updateVariant(variant.id, 'priceChild', parseFloat(value) || 0)}
                          />
                        </FormField>
                        <FormField label="Infant Price">
                          <CustomInput
                            type="number"
                            placeholder="0.00"
                            value={variant.priceInfant || ''}
                            onChange={(value) => updateVariant(variant.id, 'priceInfant', parseFloat(value) || 0)}
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* Guest Limits */}
                    <div>
                      <h5 className="font-medium mb-3 text-gray-900">Guest Limits</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Minimum Guests">
                          <CustomInput
                            type="number"
                            placeholder="1"
                            value={variant.minGuests || ''}
                            onChange={(value) => updateVariant(variant.id, 'minGuests', parseInt(value) || 1)}
                          />
                        </FormField>
                        <FormField label="Maximum Guests">
                          <CustomInput
                            type="number"
                            placeholder="Leave empty for no limit"
                            value={variant.maxGuests || ''}
                            onChange={(value) => updateVariant(variant.id, 'maxGuests', parseInt(value) || undefined)}
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Inclusions</h5>
                        <CustomButton
                          variant="outline"
                          size="sm"
                          onClick={() => addInclusion(variant.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Inclusion
                        </CustomButton>
                      </div>
                      <div className="space-y-2">
                        {variant.inclusions.map((inclusion, inclusionIndex) => (
                          <div key={inclusionIndex} className="flex items-center gap-2">
                            <CustomInput
                              placeholder="e.g., Entry tickets, Guide service, Refreshments"
                              value={inclusion}
                              onChange={(value) => updateInclusion(variant.id, inclusionIndex, value)}
                            />
                            <CustomButton
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInclusion(variant.id, inclusionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </CustomButton>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exclusions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Exclusions</h5>
                        <CustomButton
                          variant="outline"
                          size="sm"
                          onClick={() => addExclusion(variant.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exclusion
                        </CustomButton>
                      </div>
                      <div className="space-y-2">
                        {variant.exclusions.map((exclusion, exclusionIndex) => (
                          <div key={exclusionIndex} className="flex items-center gap-2">
                            <CustomInput
                              placeholder="e.g., Personal expenses, Gratuity, Transportation"
                              value={exclusion}
                              onChange={(value) => updateExclusion(variant.id, exclusionIndex, value)}
                            />
                            <CustomButton
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExclusion(variant.id, exclusionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </CustomButton>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`active-${variant.id}`}
                        checked={variant.isActive}
                        onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 bg-white/30 border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label htmlFor={`active-${variant.id}`} className="text-sm font-medium text-gray-700">
                        This variant is active and available for booking
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary View */}
              {editingVariant !== variant.id && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{variant.variantName}</p>
                      {variant.description && (
                        <p className="text-sm text-gray-600">{variant.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${variant.priceAdult}</p>
                      <p className="text-sm text-gray-600">per adult</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Min: {variant.minGuests} guests</span>
                    {variant.maxGuests && <span>Max: {variant.maxGuests} guests</span>}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      variant.isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {variants.length === 0 && (
        <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No package variants yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create different ticket options for your activity
            </p>
            <CustomButton onClick={addVariant} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Variant
            </CustomButton>
          </div>
        </div>
      )}

      {errors.variants && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {errors.variants[0]}
        </div>
      )}
    </div>
  );
};

export default PackageVariantsForm;
