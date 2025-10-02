'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { PackageVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PackageVariantsFormProps {
  variants: PackageVariant[];
  onChange: (variants: PackageVariant[]) => void;
  errors?: Record<string, string[]>;
}




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

  const updateVariant = (variantId: string, field: string, value: string | number | boolean) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Package Variants</h3>
          <p className="text-sm text-gray-600">
            Create different ticket/package options (e.g., General Admission, VIP Experience)
          </p>
        </div>
        <Button onClick={addVariant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
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
            <Card className={`${
              editingVariant === variant.id ? 'ring-2 ring-emerald-400/20 border-emerald-400/70' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                      #{index + 1}
                    </Badge>
                    <CardTitle className="text-lg">
                      {variant.variantName || 'Untitled Variant'}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVariant(variant.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveVariant(variant.id, 'down')}
                        disabled={index === variants.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVariant(
                        editingVariant === variant.id ? null : variant.id
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateVariant(variant.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(variant.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {editingVariant === variant.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <CardContent className="space-y-4">

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`variant-name-${variant.id}`}>Variant Name *</Label>
                        <Input
                          id={`variant-name-${variant.id}`}
                          placeholder="e.g., General Admission, VIP Experience"
                          value={variant.variantName}
                          onChange={(e) => updateVariant(variant.id, 'variantName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`variant-description-${variant.id}`}>Description</Label>
                        <Input
                          id={`variant-description-${variant.id}`}
                          placeholder="Brief description of this variant"
                          value={variant.description || ''}
                          onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h5 className="font-medium mb-3 text-gray-900">Pricing</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`adult-price-${variant.id}`}>Adult Price *</Label>
                          <Input
                            id={`adult-price-${variant.id}`}
                            type="number"
                            placeholder="0.00"
                            value={variant.priceAdult || ''}
                            onChange={(e) => updateVariant(variant.id, 'priceAdult', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`child-price-${variant.id}`}>Child Price</Label>
                          <Input
                            id={`child-price-${variant.id}`}
                            type="number"
                            placeholder="0.00"
                            value={variant.priceChild || ''}
                            onChange={(e) => updateVariant(variant.id, 'priceChild', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`infant-price-${variant.id}`}>Infant Price</Label>
                          <Input
                            id={`infant-price-${variant.id}`}
                            type="number"
                            placeholder="0.00"
                            value={variant.priceInfant || ''}
                            onChange={(e) => updateVariant(variant.id, 'priceInfant', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest Limits */}
                    <div>
                      <h5 className="font-medium mb-3 text-gray-900">Guest Limits</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`min-guests-${variant.id}`}>Minimum Guests</Label>
                          <Input
                            id={`min-guests-${variant.id}`}
                            type="number"
                            placeholder="1"
                            value={variant.minGuests || ''}
                            onChange={(e) => updateVariant(variant.id, 'minGuests', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`max-guests-${variant.id}`}>Maximum Guests</Label>
                          <Input
                            id={`max-guests-${variant.id}`}
                            type="number"
                            placeholder="Leave empty for no limit"
                            value={variant.maxGuests || ''}
                            onChange={(e) => updateVariant(variant.id, 'maxGuests', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Inclusions</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addInclusion(variant.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Inclusion
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {variant.inclusions.map((inclusion, inclusionIndex) => (
                          <div key={inclusionIndex} className="flex items-center gap-2">
                            <Input
                              placeholder="e.g., Entry tickets, Guide service, Refreshments"
                              value={inclusion}
                              onChange={(e) => updateInclusion(variant.id, inclusionIndex, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInclusion(variant.id, inclusionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exclusions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Exclusions</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExclusion(variant.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exclusion
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {variant.exclusions.map((exclusion, exclusionIndex) => (
                          <div key={exclusionIndex} className="flex items-center gap-2">
                            <Input
                              placeholder="e.g., Personal expenses, Gratuity, Transportation"
                              value={exclusion}
                              onChange={(e) => updateExclusion(variant.id, exclusionIndex, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExclusion(variant.id, exclusionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <Switch
                        id={`active-${variant.id}`}
                        checked={variant.isActive}
                        onCheckedChange={(checked) => updateVariant(variant.id, 'isActive', checked)}
                      />
                      <Label htmlFor={`active-${variant.id}`} className="text-sm font-medium text-gray-700">
                        This variant is active and available for booking
                      </Label>
                    </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary View */}
              {editingVariant !== variant.id && (
                <CardContent className="space-y-3">
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
                    <Badge variant={variant.isActive ? "default" : "secondary"}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {variants.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No package variants yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create different ticket options for your activity
            </p>
            <Button onClick={addVariant} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Variant
            </Button>
          </CardContent>
        </Card>
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
