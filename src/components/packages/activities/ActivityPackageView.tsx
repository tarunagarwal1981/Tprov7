'use client';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Car,
  Languages,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ActivityPackageViewProps {
  packageData: any;
  onEdit?: () => void;
  onBack?: () => void;
}

const InfoCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="backdrop-blur-xl rounded-2xl border border-white/20 p-6"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-green-100/50 rounded-xl">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const DetailField = ({ label, value, icon: Icon }: { label: string; value: any; icon: any }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const formatDuration = (hours: number) => {
  if (!hours) return 'Not specified';
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
};

const formatCapacity = (capacity: number) => {
  if (!capacity) return 'Not specified';
  return `${capacity} people`;
};

const formatAgeRestrictions = (ageRestrictions: any) => {
  if (!ageRestrictions) return 'No restrictions';
  
  const parts = [];
  if (ageRestrictions.minAge) parts.push(`Min: ${ageRestrictions.minAge} years`);
  if (ageRestrictions.maxAge) parts.push(`Max: ${ageRestrictions.maxAge} years`);
  if (ageRestrictions.adultSupervision) parts.push('Adult supervision required');
  if (ageRestrictions.notes) parts.push(ageRestrictions.notes);
  
  return parts.length > 0 ? parts.join(', ') : 'No restrictions';
};

export function ActivityPackageView({ packageData, onEdit, onBack }: ActivityPackageViewProps) {
  console.log('🎯 ActivityPackageView: Rendering with data:', packageData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20" />
        <div className="relative z-10 backdrop-blur-xl border-b border-white/40"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 100%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onBack && (
                    <Button
                      onClick={onBack}
                      variant="ghost"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back
                    </Button>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <MapPin className="w-3 h-3 mr-1" />
                        Activity Package
                      </Badge>
                      <Badge variant={packageData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {packageData.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{packageData.title}</h1>
                    <p className="text-gray-600 mt-1">{packageData.place}</p>
                  </div>
                </div>
                
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Edit Activity
                  </Button>
                )}
              </div>

              {/* Main Image */}
              {packageData.images && packageData.images.length > 0 && (
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mt-8">
                  <Image
                    src={packageData.images[0]}
                    alt={packageData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
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
              <InfoCard title="Activity Description" icon={Globe}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.description}
                </p>
              </InfoCard>
            )}

            {/* Activity Details */}
            <InfoCard title="Activity Details" icon={MapPin}>
              <div className="grid md:grid-cols-2 gap-6">
                <DetailField 
                  label="Location" 
                  value={packageData.place} 
                  icon={MapPin} 
                />
                <DetailField 
                  label="Category" 
                  value={packageData.activity_category?.replace(/_/g, ' ')} 
                  icon={Star} 
                />
                <DetailField 
                  label="Duration" 
                  value={formatDuration(packageData.duration_hours)} 
                  icon={Clock} 
                />
                <DetailField 
                  label="Max Capacity" 
                  value={formatCapacity(packageData.max_capacity)} 
                  icon={Users} 
                />
                <DetailField 
                  label="Timing" 
                  value={packageData.timing} 
                  icon={Calendar} 
                />
                <DetailField 
                  label="Meeting Point" 
                  value={packageData.meeting_point} 
                  icon={MapPin} 
                />
              </div>
            </InfoCard>

            {/* Operational Information */}
            <InfoCard title="Operational Information" icon={Clock}>
              <div className="space-y-4">
                {packageData.operational_hours && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Operating Hours</h4>
                    <p className="text-gray-600">
                      {packageData.operational_hours.start} - {packageData.operational_hours.end}
                    </p>
                  </div>
                )}
                
                {packageData.available_days && packageData.available_days.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Available Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {packageData.available_days.map((day: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {packageData.languages_supported && packageData.languages_supported.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages Supported</h4>
                    <div className="flex flex-wrap gap-2">
                      {packageData.languages_supported.map((lang: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Age Restrictions & Important Info */}
            <InfoCard title="Age Restrictions & Important Information" icon={AlertTriangle}>
              <div className="space-y-4">
                <DetailField 
                  label="Age Restrictions" 
                  value={formatAgeRestrictions(packageData.age_restrictions)} 
                  icon={Users} 
                />
                
                {packageData.important_info && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Important Information</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{packageData.important_info}</p>
                  </div>
                )}

                {packageData.accessibility_info && packageData.accessibility_info.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Accessibility Information</h4>
                    <ul className="space-y-1">
                      {packageData.accessibility_info.map((info: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Emergency Contact */}
            {packageData.emergency_contact && (
              <InfoCard title="Emergency Contact" icon={Phone}>
                <div className="space-y-3">
                  <DetailField 
                    label="Contact Name" 
                    value={packageData.emergency_contact.name} 
                    icon={Users} 
                  />
                  <DetailField 
                    label="Phone" 
                    value={packageData.emergency_contact.phone} 
                    icon={Phone} 
                  />
                  <DetailField 
                    label="Email" 
                    value={packageData.emergency_contact.email} 
                    icon={Mail} 
                  />
                </div>
              </InfoCard>
            )}

            {/* Package Variants */}
            {packageData.variants && packageData.variants.length > 0 && (
              <InfoCard title="Package Variants" icon={Star}>
                <div className="space-y-4">
                  {packageData.variants.map((variant: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{variant.variant_name}</h4>
                        <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                          {variant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {variant.description && (
                        <p className="text-gray-600 text-sm mb-3">{variant.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Adult:</span>
                          <span className="font-medium ml-1">${variant.price_adult}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Child:</span>
                          <span className="font-medium ml-1">${variant.price_child}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Min Guests:</span>
                          <span className="font-medium ml-1">{variant.min_guests}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Guests:</span>
                          <span className="font-medium ml-1">{variant.max_guests}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <InfoCard title="Quick Info" icon={Info}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={packageData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {packageData.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-sm">{new Date(packageData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-sm">{new Date(packageData.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </InfoCard>

            {/* Inclusions */}
            {packageData.inclusions && packageData.inclusions.length > 0 && (
              <InfoCard title="Inclusions" icon={CheckCircle}>
                <ul className="space-y-2">
                  {packageData.inclusions.map((inclusion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* Exclusions */}
            {packageData.exclusions && packageData.exclusions.length > 0 && (
              <InfoCard title="Exclusions" icon={XCircle}>
                <ul className="space-y-2">
                  {packageData.exclusions.map((exclusion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* Cancellation Policy */}
            {packageData.cancellation_policy_text && (
              <InfoCard title="Cancellation Policy" icon={Shield}>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {packageData.cancellation_policy_text}
                </p>
              </InfoCard>
            )}

            {/* Terms & Conditions */}
            {packageData.terms_and_conditions && packageData.terms_and_conditions.length > 0 && (
              <InfoCard title="Terms & Conditions" icon={Shield}>
                <ul className="space-y-2">
                  {packageData.terms_and_conditions.map((term: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{term}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
