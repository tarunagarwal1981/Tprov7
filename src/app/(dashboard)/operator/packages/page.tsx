'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package as PackageIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  DollarSign,
  TrendingUp,
  Loader2,
  MapPin,
  Calendar
} from 'lucide-react';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { packageService } from '@/lib/services/packageService';
import type { Package } from '@/lib/types';

// Stats Card - Compact Version
function StatsCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-2.5 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-lg`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

// Compact Package Card
function PackageCard({ pkg, onDelete }: { pkg: Package; onDelete: (id: string) => void }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    DRAFT: 'bg-yellow-100 text-yellow-700',
    INACTIVE: 'bg-slate-100 text-slate-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    ARCHIVED: 'bg-gray-100 text-gray-700',
  };

  const getPrice = () => {
    if (pkg.pricing?.basePrice) return pkg.pricing.basePrice;
    return 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
        {pkg.images && pkg.images.length > 0 ? (
          <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageIcon className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${statusColors[pkg.status || 'DRAFT']}`}>
            {pkg.status || 'DRAFT'}
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-white/90 hover:bg-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(pkg.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {pkg.title || '-'}
        </h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {pkg.destinations?.join(', ') || '-'}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center text-slate-600">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {pkg.duration ? `${pkg.duration.days} days` : '-'}
            </span>
            <span className="flex items-center text-slate-600">
              <Star className="w-3.5 h-3.5 mr-1 text-yellow-500 fill-yellow-500" />
              {pkg.rating?.toFixed(1) || '-'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="font-bold text-blue-600">
            ${getPrice().toLocaleString()}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function OperatorPackagesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load packages from database
  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await packageService.getPackages({
        limit: 50,
        page: 1,
      });

      if (response.success && response.data) {
        // Extract packages from paginated response
        const packagesData = response.data.data || [];
        setPackages(packagesData);
      } else {
        setError(response.error || 'Failed to load packages');
        setPackages([]);
      }
    } catch (err) {
      setError('An error occurred while loading packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats from database
  const loadStats = useCallback(async () => {
    try {
      const response = await packageService.getPackageStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadPackages();
    loadStats();
  }, [loadPackages, loadStats]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const response = await packageService.deletePackage(id);
      if (response.success) {
        loadPackages(); // Reload list
        loadStats(); // Reload stats
      } else {
        alert(response.error || 'Failed to delete package');
      }
    } catch (err) {
      alert('An error occurred while deleting the package');
    }
  };

  // Filter packages
  const filteredPackages = (packages || []).filter(pkg =>
    (pkg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pkg.destinations?.join(', ') || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Compact Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Packages</h1>
                <p className="text-sm text-slate-600">Manage your travel packages</p>
              </div>
              <Link href="/operator/packages/create">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create
                </Button>
              </Link>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={PackageIcon}
              label="Total"
              value={stats.totalPackages}
              color="blue"
            />
            <StatsCard
              icon={TrendingUp}
              label="Active"
              value={stats.activePackages}
              color="green"
            />
            <StatsCard
              icon={DollarSign}
              label="Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              color="purple"
            />
            <StatsCard
              icon={Star}
              label="Rating"
              value={stats.averageRating.toFixed(1)}
              color="orange"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <Button size="sm" onClick={loadPackages} className="mt-3">
                Retry
              </Button>
            </div>
          )}

          {/* Packages Grid - Compact */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPackages.length === 0 && (
            <div className="text-center py-16">
              <PackageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? 'No packages found' : 'No packages yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your first package to get started'}
              </p>
              {!searchQuery && (
                <Link href="/operator/packages/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Package
                  </Button>
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}