'use client';

import { motion } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  Phone,
  Mail,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface TransfersPackageViewProps {
  packageData: any;
  onEdit?: () => void;
  onBack?: () => void;
}

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
  value: string | number | undefined;
  icon?: React.ElementType;
}) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="p-2 rounded-lg bg-blue-50 mt-1">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
};

const VehicleConfigCard = ({ config }: { config: any }) => (
  <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-4"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
  }}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-semibold text-gray-900">{config.name}</h4>
        <p className="text-sm text-gray-600 capitalize">{config.vehicle_type?.toLowerCase().replace('_', ' ')}</p>
      </div>
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {config.min_passengers}-{config.max_passengers} passengers
      </Badge>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Base Price:</span>
        <span className="font-semibold text-gray-900">
          ₹{config.base_price?.toLocaleString()}
        </span>
      </div>
      
      {config.per_km_rate && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Per KM:</span>
          <span className="text-sm text-gray-700">₹{config.per_km_rate}</span>
        </div>
      )}
      
      {config.per_hour_rate && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Per Hour:</span>
          <span className="text-sm text-gray-700">₹{config.per_hour_rate}</span>
        </div>
      )}
    </div>
    
    {config.description && (
      <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
        {config.description}
      </p>
    )}
    
    {config.features && config.features.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
        <div className="flex flex-wrap gap-1">
          {config.features.map((feature: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </div>
);

const AdditionalServiceCard = ({ service }: { service: any }) => (
  <div className="backdrop-blur-xl rounded-xl border border-white/20 p-4"
  style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
  }}>
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-gray-900">{service.name}</h4>
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        ₹{service.price?.toLocaleString()}
      </Badge>
    </div>
    {service.description && (
      <p className="text-sm text-gray-600">{service.description}</p>
    )}
  </div>
);

export function TransfersPackageView({ packageData, onEdit, onBack }: TransfersPackageViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'Not specified';
    return duration;
  };

  const formatDistance = (distance: number) => {
    if (!distance) return 'Not specified';
    return `${distance} km`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="backdrop-blur-sm border border-white/20"
                >
                  ← Back
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {packageData.title || packageData.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge variant="info" className="bg-blue-100 text-blue-800">
                    {packageData.type?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge 
                    variant={packageData.status === 'ACTIVE' ? 'success' : 'secondary'}
                    className={
                      packageData.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {packageData.status}
                  </Badge>
                  {packageData.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{packageData.rating}</span>
                      <span>({packageData.review_count || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {onEdit && (
              <Button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Car className="w-4 h-4 mr-2" />
                Edit Transfer
              </Button>
            )}
          </div>

          {/* Main Image */}
          {packageData.images && packageData.images.length > 0 && (
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <img
                src={packageData.images[0]}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
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
              <InfoCard title="Service Description" icon={Globe}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.description}
                </p>
              </InfoCard>
            )}

            {/* Transfer Details */}
            <InfoCard title="Transfer Details" icon={Car}>
              <div className="grid md:grid-cols-2 gap-6">
                <DetailField 
                  label="Place/Destination" 
                  value={packageData.place} 
                  icon={MapPin} 
                />
                <DetailField 
                  label="From Location" 
                  value={packageData.from_location} 
                  icon={MapPin} 
                />
                <DetailField 
                  label="To Location" 
                  value={packageData.to_location} 
                  icon={MapPin} 
                />
                <DetailField 
                  label="Service Type" 
                  value={packageData.transfer_service_type?.replace(/_/g, ' ')} 
                  icon={Car} 
                />
                <DetailField 
                  label="Distance" 
                  value={formatDistance(packageData.distance_km)} 
                  icon={MapPin} 
                />
                <DetailField 
                  label="Estimated Duration" 
                  value={formatDuration(packageData.estimated_duration)} 
                  icon={Clock} 
                />
                <DetailField 
                  label="Advance Booking Required" 
                  value={packageData.advance_booking_hours ? `${packageData.advance_booking_hours} hours` : 'Not specified'} 
                  icon={Calendar} 
                />
              </div>
            </InfoCard>

            {/* Vehicle Configurations */}
            {packageData.vehicleConfigs && packageData.vehicleConfigs.length > 0 && (
              <InfoCard title="Vehicle Options" icon={Users}>
                <div className="grid md:grid-cols-2 gap-4">
                  {packageData.vehicleConfigs.map((config: any, index: number) => (
                    <VehicleConfigCard key={index} config={config} />
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Additional Services */}
            {packageData.additionalServices && packageData.additionalServices.length > 0 && (
              <InfoCard title="Additional Services" icon={Plus}>
                <div className="grid md:grid-cols-2 gap-4">
                  {packageData.additionalServices.map((service: any, index: number) => (
                    <AdditionalServiceCard key={index} service={service} />
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-6">
              {packageData.inclusions && packageData.inclusions.length > 0 && (
                <InfoCard title="Inclusions" icon={CheckCircle}>
                  <ul className="space-y-2">
                    {packageData.inclusions.map((inclusion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}

              {packageData.exclusions && packageData.exclusions.length > 0 && (
                <InfoCard title="Exclusions" icon={XCircle}>
                  <ul className="space-y-2">
                    {packageData.exclusions.map((exclusion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              )}
            </div>

            {/* Terms & Conditions */}
            {packageData.termsAndConditions && packageData.termsAndConditions.length > 0 && (
              <InfoCard title="Terms & Conditions" icon={Shield}>
                <ul className="space-y-3">
                  {packageData.termsAndConditions.map((term: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{term}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* Cancellation Policy */}
            {packageData.cancellationPolicyText && (
              <InfoCard title="Cancellation Policy" icon={Shield}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.cancellationPolicyText}
                </p>
              </InfoCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <InfoCard title="Quick Info" icon={Info}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge 
                    variant={packageData.status === 'ACTIVE' ? 'success' : 'secondary'}
                    className={
                      packageData.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {packageData.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(packageData.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(packageData.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                {packageData.rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-900">{packageData.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Pricing Summary */}
            {packageData.vehicleConfigs && packageData.vehicleConfigs.length > 0 && (
              <InfoCard title="Pricing Summary" icon={DollarSign}>
                <div className="space-y-3">
                  {packageData.vehicleConfigs.map((config: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{config.name}</p>
                        <p className="text-sm text-gray-600">
                          {config.min_passengers}-{config.max_passengers} passengers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(config.base_price)}
                        </p>
                        {config.per_km_rate && (
                          <p className="text-xs text-gray-600">
                            +{formatPrice(config.per_km_rate)}/km
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Contact Info */}
            <InfoCard title="Contact Information" icon={Phone}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">support@transfercompany.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">www.transfercompany.com</span>
                </div>
              </div>
            </InfoCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function for className concatenation
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
