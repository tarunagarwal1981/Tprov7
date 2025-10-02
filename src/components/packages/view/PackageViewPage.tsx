'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PackageType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Calendar,
  Star,
  CheckCircle,
  X,
  Camera,
  Globe,
  Plane,
  Car,
  Building,
  Bed,
  Trophy,
  Eye,
  BarChart3,
  Package,
  Shield,
  FileText,
  Info,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Helper function to ensure arrays
const ensureArray = <T,>(value: T[] | T | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
};

interface PackageData {
  id: string;
  type: PackageType;
  title: string;
  description?: string;
  status: string;
  place?: string;
  from_location?: string;
  to_location?: string;
  timing?: string;
  duration_hours?: number;
  duration_days?: number;
  max_group_size?: number;
  additional_notes?: string;
  destinations?: string;
  inclusions?: string;
  exclusions?: string;
  tour_inclusions?: string;
  tour_exclusions?: string;
  itinerary?: string;
  hotels?: string;
  pricing_slabs?: string;
  adult_price?: number;
  child_price?: number;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

const PackageTypeIcon = ({ type }: { type: PackageType }) => {
  const iconMap = {
    [PackageType.TRANSFERS]: Car,
    [PackageType.ACTIVITY]: Star,
    [PackageType.MULTI_CITY_PACKAGE]: Package,
    [PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL]: Building,
    [PackageType.FIXED_DEPARTURE_WITH_FLIGHT]: Plane
  };
  const IconComponent = iconMap[type] || Package;
  return <IconComponent className="w-5 h-5" />;
};

const Badge = ({ children, variant = 'default', className = '' }: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

const InfoCard = ({ title, children, icon: Icon, className = '' }: {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  className?: string;
}) => (
  <div className={cn("backdrop-blur-xl rounded-3xl border border-white/40 p-7", className)}
  style={{
    boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
  }}>
    <div className="flex items-center gap-4 mb-5">
      <div className="p-3 backdrop-blur-md rounded-2xl border border-white/50"
      style={{
        boxShadow: '0 8px 25px rgba(59,130,246,0.2), inset 0 2px 4px rgba(255,255,255,0.6)'
      }}>
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailField = ({ label, value, icon: Icon }: {
  label: string;
  value: string | number | undefined | null;
  icon?: React.ElementType;
}) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const ListDisplay = ({ items, title, icon: Icon, variant = 'success' }: {
  items: string[];
  title: string;
  icon: React.ElementType;
  variant?: 'success' | 'danger';
}) => {
  const safeItems = ensureArray(items);
  if (safeItems.length === 0) return null;

  const iconColor = variant === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <InfoCard title={title} icon={Icon}>
      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconColor)} />
            <span className="text-gray-700 text-sm">{item}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};

const ItineraryDay = ({ day, isLast = false }: {
  day: { day: number; title: string; description: string; activities?: string[] };
  isLast?: boolean;
}) => (
  <div className="relative">
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {day.day}
        </div>
        {!isLast && <div className="w-0.5 h-16 bg-gray-200 mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <h4 className="font-semibold text-gray-900 mb-2">{day.title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{day.description}</p>
        {day.activities && day.activities.length > 0 && (
          <div className="space-y-1">
            {day.activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-500">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                {activity}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function ImprovedPackageViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const packageId = searchParams.get('id');

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

        if (fetchError) {
          console.error('❌ Database error:', fetchError);
          throw fetchError;
        }

        if (!packageRow) {
          throw new Error('Package not found');
        }

        setPackageData(packageRow);
      } catch (err: any) {
        console.error('💥 Error fetching package:', err);
        setError(err?.message || 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleEdit = () => {
    console.log('🚀 Edit button clicked for package ID:', packageId);
    console.log('🚀 Package type:', packageData?.type);
    if (packageData?.type === 'TRANSFERS') {
      console.log('🚀 Redirecting to transfers edit page');
      router.push(`/operator/packages/transfers/edit?id=${packageId}`);
    } else {
      console.log('🚀 Redirecting to regular edit page');
    router.push(`/operator/packages/edit?id=${packageId}`);
    }
  };

  const handleBack = () => {
    router.push('/operator/packages');
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
            <Eye className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The package you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </button>
        </motion.div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'success' as const, label: 'Active' },
      DRAFT: { variant: 'warning' as const, label: 'Draft' },
      INACTIVE: { variant: 'danger' as const, label: 'Inactive' },
      ARCHIVED: { variant: 'default' as const, label: 'Archived' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price) return 'Price not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Parse JSON fields
  const destinations = ensureArray(safeJsonParse(packageData.destinations, []));
  const inclusions = ensureArray(safeJsonParse(packageData.inclusions, []));
  const exclusions = ensureArray(safeJsonParse(packageData.exclusions, []));
  const tourInclusions = ensureArray(safeJsonParse(packageData.tour_inclusions, []));
  const tourExclusions = ensureArray(safeJsonParse(packageData.tour_exclusions, []));
  const itinerary = ensureArray(safeJsonParse(packageData.itinerary, []));
  const hotels = ensureArray(safeJsonParse(packageData.hotels, []));
  const pricingSlabs = ensureArray(safeJsonParse(packageData.pricing_slabs, []));

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Header */}
      <div className="backdrop-blur-xl bg-white/90 border-b border-white/40 relative z-10" style={{
        boxShadow: '0 15px 40px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 backdrop-blur-sm rounded-xl border border-white/20"
                style={{
                  boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <PackageTypeIcon type={packageData.type} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{packageData.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(packageData.status)}
                    <Badge variant="info">{packageData.type.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 text-gray-700 backdrop-blur-sm rounded-xl hover:scale-105 transition-all duration-200 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 text-gray-700 backdrop-blur-sm rounded-xl hover:scale-105 transition-all duration-200 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <Edit className="w-4 h-4" />
                Edit Package
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {packageData.description && (
              <InfoCard title="Description" icon={Globe}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.description}
                </p>
              </InfoCard>
            )}

            {/* Package Specific Details */}
            {packageData.type === PackageType.TRANSFERS && (
              <InfoCard title="Transfer Details" icon={Car}>
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailField label="Place/Destination" value={packageData.place} icon={MapPin} />
                  <DetailField label="From Location" value={packageData.from_location} />
                  <DetailField label="To Location" value={packageData.to_location} />
                  <DetailField label="Service Type" value={packageData.transfer_service_type?.replace(/_/g, ' ')} />
                  <DetailField label="Distance" value={packageData.distance_km ? `${packageData.distance_km} km` : undefined} />
                  <DetailField label="Estimated Duration" value={packageData.estimated_duration} />
                  <DetailField label="Advance Booking Required" value={packageData.advance_booking_hours ? `${packageData.advance_booking_hours} hours` : undefined} />
                </div>
              </InfoCard>
            )}

            {packageData.type === PackageType.ACTIVITY && (
              <InfoCard title="Activity Details" icon={Star}>
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailField label="Place/Destination" value={packageData.place} icon={MapPin} />
                  <DetailField label="Timing" value={packageData.timing} icon={Clock} />
                  <DetailField label="Duration" value={packageData.duration_hours ? `${packageData.duration_hours} hours` : undefined} icon={Clock} />
                </div>
              </InfoCard>
            )}

            {(packageData.type === PackageType.MULTI_CITY_PACKAGE || 
              packageData.type === PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL ||
              packageData.type === PackageType.FIXED_DEPARTURE_WITH_FLIGHT) && (
              <InfoCard title="Package Details" icon={Package}>
                <div className="grid md:grid-cols-2 gap-6">
                  <DetailField label="Duration" value={packageData.duration_days ? `${packageData.duration_days} days` : undefined} icon={Calendar} />
                  <DetailField label="Max Group Size" value={packageData.max_group_size ? `${packageData.max_group_size} people` : undefined} icon={Users} />
                  {destinations.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 block mb-2">Destinations</label>
                      <div className="flex flex-wrap gap-2">
                        {destinations.map((dest: string, index: number) => (
                          <Badge key={index} variant="info">{dest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Hotels Information */}
            {hotels.length > 0 && (
              <InfoCard title="Accommodation" icon={Bed}>
                <div className="space-y-4">
                  {hotels.map((hotel: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Hotel {index + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <DetailField label="Name" value={hotel.name} />
                        <DetailField label="Location" value={hotel.location} />
                        <DetailField label="Check-in" value={hotel.checkIn} />
                        <DetailField label="Check-out" value={hotel.checkOut} />
                        <DetailField label="Room Type" value={hotel.roomType} />
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <InfoCard title="Day-wise Itinerary" icon={Calendar}>
                <div className="space-y-4">
                  {itinerary.map((day: any, index: number) => (
                    <ItineraryDay 
                      key={index} 
                      day={day} 
                      isLast={index === itinerary.length - 1} 
                    />
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-6">
              <ListDisplay 
                items={inclusions} 
                title="Inclusions" 
                icon={CheckCircle}
                variant="success"
              />
              <ListDisplay 
                items={exclusions} 
                title="Exclusions" 
                icon={X}
                variant="danger"
              />
            </div>

            {/* Tour Inclusions & Exclusions */}
            {(tourInclusions.length > 0 || tourExclusions.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                <ListDisplay 
                  items={tourInclusions} 
                  title="Tour Inclusions" 
                  icon={CheckCircle}
                  variant="success"
                />
                <ListDisplay 
                  items={tourExclusions} 
                  title="Tour Exclusions" 
                  icon={X}
                  variant="danger"
                />
              </div>
            )}

            {/* Additional Notes */}
            {packageData.additional_notes && (
              <InfoCard title="Additional Notes" icon={FileText}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.additional_notes}
                </p>
              </InfoCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="backdrop-blur-xl rounded-3xl border border-white/40 p-7"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <h3 className="font-semibold text-gray-900 mb-4">Package Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Starting Price</p>
                    <p className="font-semibold text-lg text-green-600">
                      {formatPrice(packageData.adult_price)}
                    </p>
                  </div>
                </div>

                {packageData.duration_days && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold">{packageData.duration_days} days</p>
                    </div>
                  </div>
                )}

                {packageData.duration_hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold">{packageData.duration_hours} hours</p>
                    </div>
                  </div>
                )}

                {packageData.max_group_size && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Max Group Size</p>
                      <p className="font-semibold">{packageData.max_group_size} people</p>
                    </div>
                  </div>
                )}

                {packageData.place && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{packageData.place}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Details */}
            {pricingSlabs.length > 0 ? (
              <div className="backdrop-blur-xl rounded-3xl border border-white/40 p-7"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <h3 className="font-semibold text-gray-900 mb-4">Pricing Tiers</h3>
                <div className="space-y-4">
                  {pricingSlabs.map((tier: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Tier {index + 1}</span>
                        {tier.validFrom && tier.validTo && (
                          <Badge variant="info">
                            {tier.validFrom} - {tier.validTo}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Adult:</span>
                          <span className="font-semibold ml-2">${tier.adultPrice}</span>
                        </div>
                        {tier.childPrice > 0 && (
                          <div>
                            <span className="text-gray-500">Child:</span>
                            <span className="font-semibold ml-2">${tier.childPrice}</span>
                          </div>
                        )}
                      </div>
                      {tier.notes && (
                        <div className="mt-2 text-xs text-gray-600">
                          {tier.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="backdrop-blur-xl rounded-3xl border border-white/40 p-7"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
              }}>
                <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  {packageData.adult_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Adult Price:</span>
                      <span className="font-semibold">{formatPrice(packageData.adult_price)}</span>
                    </div>
                  )}
                  {packageData.child_price && packageData.child_price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Child Price:</span>
                      <span className="font-semibold">{formatPrice(packageData.child_price)}</span>
                    </div>
                  )}
                  {packageData.valid_from && packageData.valid_to && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-sm">Valid:</span>
                      <p className="font-medium text-sm">
                        {packageData.valid_from} to {packageData.valid_to}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Package Metadata */}
            <div className="backdrop-blur-xl rounded-3xl border border-white/40 p-7"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <h3 className="font-semibold text-gray-900 mb-4">Package Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">
                    {new Date(packageData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(packageData.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Package ID:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {packageData.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-xl rounded-3xl border border-white/40 p-7"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-start gap-3 px-4 py-3 text-left text-blue-700 rounded-xl hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Package
                </button>
                <button className="w-full flex items-center justify-start gap-3 px-4 py-3 text-left text-gray-700 rounded-xl hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </button>
                <button className="w-full flex items-center justify-start gap-3 px-4 py-3 text-left text-gray-700 rounded-xl hover:scale-105 transition-all duration-200 border border-white/20 backdrop-blur-sm"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  <Trophy className="w-4 h-4" />
                  Manage Bookings
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
