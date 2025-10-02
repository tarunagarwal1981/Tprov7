'use client';

import { useState } from 'react';
import type { PackageFilters } from '@/lib/services/packageService';
import { PackageType, PackageStatus, DifficultyLevel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Checkbox,
} from '@/components/ui/checkbox';
import { 
  X, 
  Filter, 
  Calendar,
  DollarSign,
  MapPin,
  Package as PackageIcon,
  Activity,
  Zap
} from 'lucide-react';

interface PackageFiltersProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
  onClose: () => void;
}

export default function PackageFilters({ filters, onFiltersChange, onClose }: PackageFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PackageFilters>(filters);

  // Package type options
  const packageTypes = [
    { value: PackageType.ACTIVITY, label: 'Activity', icon: Activity },
    { value: PackageType.LAND_PACKAGE, label: 'Land Package', icon: PackageIcon },
    { value: PackageType.CRUISE, label: 'Cruise', icon: PackageIcon },
    { value: PackageType.HOTEL, label: 'Hotel', icon: PackageIcon },
    { value: PackageType.FLIGHT, label: 'Flight', icon: PackageIcon },
    { value: PackageType.TRANSFERS, label: 'Transfers', icon: PackageIcon },
    { value: PackageType.COMBO, label: 'Combo', icon: PackageIcon },
    { value: PackageType.CUSTOM, label: 'Custom', icon: PackageIcon },
  ];

  // Status options
  const statusOptions = [
    { value: PackageStatus.ACTIVE, label: 'Active', color: 'green' },
    { value: PackageStatus.DRAFT, label: 'Draft', color: 'yellow' },
    { value: PackageStatus.INACTIVE, label: 'Inactive', color: 'gray' },
    { value: PackageStatus.SUSPENDED, label: 'Suspended', color: 'red' },
    { value: PackageStatus.ARCHIVED, label: 'Archived', color: 'gray' },
  ];

  // Difficulty options
  const difficultyOptions = [
    { value: DifficultyLevel.EASY, label: 'Easy', color: 'green' },
    { value: DifficultyLevel.MODERATE, label: 'Moderate', color: 'yellow' },
    { value: DifficultyLevel.CHALLENGING, label: 'Challenging', color: 'orange' },
    { value: DifficultyLevel.EXPERT, label: 'Expert', color: 'red' },
  ];

  // Popular destinations (mock data)
  const popularDestinations = [
    'Bali', 'Thailand', 'Japan', 'Italy', 'France', 'Spain', 'Greece',
    'Turkey', 'Morocco', 'India', 'Nepal', 'Peru', 'Brazil', 'Mexico',
    'Costa Rica', 'New Zealand', 'Australia', 'South Africa', 'Egypt',
    'Jordan', 'Dubai', 'Singapore', 'Malaysia', 'Vietnam', 'Cambodia'
  ];

  // Popular tags
  const popularTags = [
    'adventure', 'culture', 'beach', 'mountains', 'city', 'nature',
    'wildlife', 'history', 'food', 'photography', 'wellness', 'luxury',
    'budget', 'family', 'romantic', 'solo', 'group', 'hiking', 'diving',
    'safari', 'cruise', 'backpacking', 'spiritual', 'art', 'music'
  ];

  // Handle filter changes
  const updateFilter = (key: keyof PackageFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Handle array filter changes (for tags, destinations)
  const updateArrayFilter = (key: keyof PackageFilters, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    const newFilters = { ...localFilters, [key]: newArray.length > 0 ? newArray : undefined };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: PackageFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <Card className="w-full backdrop-blur-xl border border-white/20"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
    }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="backdrop-blur-sm border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {getActiveFilterCount() > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Package Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Package Type</Label>
          <div className="space-y-2">
            {packageTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={localFilters.type === type.value}
                  onCheckedChange={(checked) => 
                    updateFilter('type', checked ? type.value : undefined)
                  }
                />
                <Label 
                  htmlFor={`type-${type.value}`}
                  className="text-sm flex items-center cursor-pointer"
                >
                  <span className="mr-2">{type.icon && <type.icon className="w-4 h-4" />}</span>
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Status</Label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={localFilters.status === status.value}
                  onCheckedChange={(checked) => 
                    updateFilter('status', checked ? status.value : undefined)
                  }
                />
                <Label 
                  htmlFor={`status-${status.value}`}
                  className="text-sm flex items-center cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full bg-${status.color}-500 mr-2`}></div>
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Difficulty Level</Label>
          <div className="space-y-2">
            {difficultyOptions.map((difficulty) => (
              <div key={difficulty.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${difficulty.value}`}
                  checked={localFilters.difficulty === difficulty.value}
                  onCheckedChange={(checked) => 
                    updateFilter('difficulty', checked ? difficulty.value : undefined)
                  }
                />
                <Label 
                  htmlFor={`difficulty-${difficulty.value}`}
                  className="text-sm flex items-center cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full bg-${difficulty.color}-500 mr-2`}></div>
                  {difficulty.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-price" className="text-xs text-gray-500">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={localFilters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max-price" className="text-xs text-gray-500">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="10000"
                value={localFilters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Destination */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Destination</Label>
          <Input
            placeholder="Search destinations..."
            value={localFilters.destination || ''}
            onChange={(e) => updateFilter('destination', e.target.value || undefined)}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {popularDestinations.slice(0, 8).map((dest) => (
              <Badge
                key={dest}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => updateFilter('destination', dest)}
              >
                {dest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Tags</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {popularTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={(localFilters.tags || []).includes(tag)}
                  onCheckedChange={(checked) => 
                    updateArrayFilter('tags', tag, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`tag-${tag}`}
                  className="text-sm cursor-pointer capitalize"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Featured</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={localFilters.isFeatured === true}
              onCheckedChange={(checked) => 
                updateFilter('isFeatured', checked ? true : undefined)
              }
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Featured packages only
            </Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/20 space-y-2">
          <Button 
            onClick={applyFilters}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 32px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full backdrop-blur-sm border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
