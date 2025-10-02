'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Package as PackageIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { Button } from '@/components/ui/button';
import { packageService } from '@/lib/services/packageService';
import type { Package } from '@/lib/types';

export default function PackageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await packageService.getPackage(packageId);
      
      if (response.success && response.data) {
        setPackageData(response.data);
      } else {
        setError(response.error || 'Package not found');
      }
    } catch (err) {
      setError('An error occurred while loading the package');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const response = await packageService.deletePackage(packageId);
      if (response.success) {
        router.push('/operator/packages');
      } else {
        alert(response.error || 'Failed to delete package');
      }
    } catch (err) {
      alert('An error occurred while deleting the package');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'DRAFT':
        return <Edit className="w-4 h-4" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4" />;
      case 'SUSPENDED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <PackageIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <OperatorSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div 
          className="transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        >
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading package details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <OperatorSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div 
          className="transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        >
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Package Not Found</h2>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/operator/packages')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Packages
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OperatorSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/operator/packages')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{packageData.title}</h1>
                <p className="text-slate-600">Package Details</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(packageData.status)}`}>
                {getStatusIcon(packageData.status)}
                <span>{packageData.status}</span>
              </span>
              
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
                <p className="text-slate-600 leading-relaxed">{packageData.description}</p>
              </motion.div>

              {/* Package Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Destinations</p>
                      <p className="font-medium text-slate-900">{packageData.destinations?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="font-medium text-slate-900">{packageData.duration ? `${packageData.duration.days} days` : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Group Size</p>
                      <p className="font-medium text-slate-900">
                        {packageData.groupSize ? `${packageData.groupSize.min}-${packageData.groupSize.max} people` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <PackageIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-medium text-slate-900">{packageData.type}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Inclusions & Exclusions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Inclusions</h3>
                    <ul className="space-y-2">
                      {packageData.inclusions?.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      )) || <li className="text-slate-500">No inclusions specified</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Exclusions</h3>
                    <ul className="space-y-2">
                      {packageData.exclusions?.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      )) || <li className="text-slate-500">No exclusions specified</li>}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Base Price</span>
                    <span className="font-semibold text-slate-900">
                      ${packageData.pricing?.basePrice || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Currency</span>
                    <span className="font-medium text-slate-900">{packageData.pricing?.currency || 'USD'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Price Type</span>
                    <span className="font-medium text-slate-900">
                      {packageData.pricing?.pricePerPerson ? 'Per Person' : 'Per Package'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-slate-900">{packageData.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Reviews</span>
                    <span className="font-medium text-slate-900">{packageData.reviewCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Featured</span>
                    <span className={`font-medium ${packageData.isFeatured ? 'text-green-600' : 'text-slate-500'}`}>
                      {packageData.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Difficulty</span>
                    <span className="font-medium text-slate-900">{packageData.difficulty || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Package
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700" size="sm" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Package
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
