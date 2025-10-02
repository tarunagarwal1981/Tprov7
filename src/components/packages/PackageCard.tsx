'use client';

import { useState, memo, useCallback, useEffect } from 'react';
import { Package, PackageStatus, PackageType } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Archive, 
  BarChart3, 
  Eye, 
  Calendar,
  MapPin,
  Users,
  Star,
  DollarSign,
  Clock,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { PackageAnalyticsService, PackageAnalytics } from '@/lib/services/packageAnalyticsService';

interface PackageCardProps {
  package: Package;
  viewMode: 'grid' | 'list';
}

export default memo(function PackageCard({ package: pkg, viewMode }: PackageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await PackageAnalyticsService.getPackageAnalytics(pkg.id);
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [pkg.id]);

  // Get status badge styling
  const getStatusBadge = (status: PackageStatus) => {
    const statusConfig = {
      [PackageStatus.ACTIVE]: { 
        label: 'Active', 
        className: 'bg-green-100 text-green-800 border-green-200' 
      },
      [PackageStatus.DRAFT]: { 
        label: 'Draft', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      },
      [PackageStatus.INACTIVE]: { 
        label: 'Inactive', 
        className: 'bg-gray-100 text-gray-800 border-gray-200' 
      },
      [PackageStatus.SUSPENDED]: { 
        label: 'Suspended', 
        className: 'bg-red-100 text-red-800 border-red-200' 
      },
      [PackageStatus.ARCHIVED]: { 
        label: 'Archived', 
        className: 'bg-gray-100 text-gray-600 border-gray-200' 
      },
    };

    const config = statusConfig[status] || statusConfig[PackageStatus.DRAFT];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Get package type icon
  const getTypeIcon = (type: PackageType) => {
    const iconMap = {
      [PackageType.ACTIVITY]: '🎯',
      [PackageType.TRANSFERS]: '🚗',
      [PackageType.LAND_PACKAGE]: '🏔️',
      [PackageType.CRUISE]: '🚢',
      [PackageType.HOTEL]: '🏨',
      [PackageType.FLIGHT]: '✈️',
      [PackageType.COMBO]: '📦',
      [PackageType.CUSTOM]: '⚙️',
    };
    return iconMap[type] || '📦';
  };

  // Format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not specified';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  // Get analytics data (use real data if available, otherwise show zeros)
  const analyticsData = {
    views: analytics?.total_views || 0,
    bookings: analytics?.total_bookings || 0,
    rating: analytics?.average_rating || 0,
    revenue: analytics?.total_revenue || 0,
  };

  // Handle actions
  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'edit':
        console.log('🚀 Edit action clicked for package:', pkg.id, 'type:', pkg.type);
        if (pkg.type === 'TRANSFERS') {
          console.log('🚀 Redirecting to transfers edit page');
          window.location.href = `/operator/packages/transfers/edit?id=${pkg.id}`;
        } else {
          console.log('🚀 Redirecting to regular edit page');
          window.location.href = `/operator/packages/edit?id=${pkg.id}`;
        }
        break;
      case 'duplicate':
        window.location.href = `/operator/packages/create?duplicate=${pkg.id}`;
        break;
      case 'archive':
        // Handle archive action
        console.log('Archive package:', pkg.id);
        break;
      case 'analytics':
        window.location.href = `/operator/packages/analytics?id=${pkg.id}`;
        break;
      case 'view':
        window.location.href = `/operator/packages/view?id=${pkg.id}`;
        break;
    }
  }, [pkg.id]);

  // Grid view
  if (viewMode === 'grid') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-xl border border-white/20"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02) rotateX(5deg) rotateY(2deg)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)';
      }}>
        {/* Image */}
        <div className="relative h-36 bg-gray-200">
          {pkg.images && pkg.images.length > 0 && !imageError ? (
            <Image
              src={pkg.images[0]}
              alt={pkg.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
              <div className="text-6xl">{getTypeIcon(pkg.type)}</div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className="backdrop-blur-sm rounded-xl px-2 py-1 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              {getStatusBadge(pkg.status)}
            </div>
          </div>

          {/* Featured Badge */}
          {pkg.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge className="backdrop-blur-sm border border-yellow-200/30"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(217,119,6,0.8) 100%)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Actions Dropdown */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 backdrop-blur-sm border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="backdrop-blur-xl border border-white/40 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                <DropdownMenuItem onClick={() => handleAction('view')}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('edit')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Package
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction('analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAction('archive')}
                  className="text-red-600"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Title and Type */}
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {pkg.title}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-1">{getTypeIcon(pkg.type)}</span>
                <span className="capitalize">{pkg.type.toLowerCase().replace('_', ' ')}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {pkg.description}
            </p>

            {/* Destinations */}
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">
                {pkg.destinations.join(', ')}
              </span>
            </div>

            {/* Duration and Group Size */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{pkg.duration.days} days</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{pkg.groupSize.min}-{pkg.groupSize.max}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(pkg.pricing.basePrice, pkg.pricing.currency)}
                {pkg.pricing.pricePerPerson && (
                  <span className="text-sm text-gray-500 font-normal">/person</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                <span>{analyticsData.rating > 0 ? analyticsData.rating.toFixed(1) : 'No rating'}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              <div className="text-center">
                <div className="text-xs text-gray-500">Views</div>
                <div className="text-sm font-semibold text-gray-900">
                  {analyticsData.views.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Bookings</div>
                <div className="text-sm font-semibold text-gray-900">
                  {analyticsData.bookings}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Revenue</div>
                <div className="text-sm font-semibold text-gray-900">
                  ${analyticsData.revenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="text-xs text-gray-400">
              Created {formatDate(pkg.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
            {pkg.images && pkg.images.length > 0 && !imageError ? (
              <Image
                src={pkg.images[0]}
                alt={pkg.title}
                fill
                className="object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <div className="text-2xl">{getTypeIcon(pkg.type)}</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {pkg.title}
                  </h3>
                  {getStatusBadge(pkg.status)}
                  {pkg.isFeatured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{pkg.destinations.join(', ')}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{pkg.duration.days} days</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{pkg.groupSize.min}-{pkg.groupSize.max} people</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    <span>{analyticsData.rating > 0 ? analyticsData.rating.toFixed(1) : 'No rating'}</span>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center space-x-4 ml-6">
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900">
                    {formatPrice(pkg.pricing.basePrice, pkg.pricing.currency)}
                    {pkg.pricing.pricePerPerson && (
                      <span className="text-sm text-gray-500 font-normal">/person</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {formatDate(pkg.createdAt)}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="backdrop-blur-xl border border-white/40 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 100%)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                    }}
                  >
                    <DropdownMenuItem onClick={() => handleAction('view')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('edit')}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Package
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction('analytics')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleAction('archive')}
                      className="text-red-600"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
