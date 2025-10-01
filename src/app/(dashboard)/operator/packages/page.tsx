'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp
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

// Types
interface PackageStats {
  totalPackages: number;
  activePackages: number;
  totalRevenue: number;
  averageRating: number;
}

interface PackageItem {
  id: string;
  name: string;
  type: string;
  destination: string;
  price: number;
  duration: string;
  status: 'active' | 'draft' | 'inactive';
  rating: number;
  bookings: number;
  revenue: number;
  image?: string;
  createdAt: string;
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, trend, color }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 font-semibold mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Package Card Component
function PackageCard({ pkg }: { pkg: PackageItem }) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {pkg.image ? (
          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-lg border ${statusColors[pkg.status]}`}>
            {pkg.status}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Edit Package
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Type */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {pkg.name}
          </h3>
          <p className="text-sm text-slate-500 flex items-center">
            <Package className="w-3.5 h-3.5 mr-1" />
            {pkg.type}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
            {pkg.destination}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
            {pkg.duration}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Star className="w-4 h-4 mr-1.5 text-yellow-500 fill-yellow-500" />
            {pkg.rating.toFixed(1)}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <DollarSign className="w-4 h-4 mr-1.5 text-slate-400" />
            ${pkg.price.toLocaleString()}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Bookings</p>
            <p className="text-sm font-bold text-slate-900">{pkg.bookings}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Revenue</p>
            <p className="text-sm font-bold text-green-600">${pkg.revenue.toLocaleString()}</p>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View
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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [stats, setStats] = useState<PackageStats>({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // Mock data - replace with API call
    setStats({
      totalPackages: 24,
      activePackages: 18,
      totalRevenue: 125430,
      averageRating: 4.6,
    });

    setPackages([
      {
        id: '1',
        name: 'Bali Adventure Complete Package',
        type: 'Multi-City Tour',
        destination: 'Bali, Indonesia',
        price: 2500,
        duration: '7 Days',
        status: 'active',
        rating: 4.8,
        bookings: 45,
        revenue: 112500,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'European Grand Tour',
        type: 'Multi-City with Hotel',
        destination: 'Europe',
        price: 4200,
        duration: '14 Days',
        status: 'active',
        rating: 4.9,
        bookings: 32,
        revenue: 134400,
        createdAt: '2024-01-10',
      },
      {
        id: '3',
        name: 'Dubai Luxury Experience',
        type: 'Hotel Package',
        destination: 'Dubai, UAE',
        price: 3800,
        duration: '5 Days',
        status: 'active',
        rating: 4.7,
        bookings: 28,
        revenue: 106400,
        createdAt: '2024-01-08',
      },
      {
        id: '4',
        name: 'Maldives Beach Resort',
        type: 'Hotel Package',
        destination: 'Maldives',
        price: 5500,
        duration: '6 Days',
        status: 'draft',
        rating: 0,
        bookings: 0,
        revenue: 0,
        createdAt: '2024-01-20',
      },
    ]);
  }, []);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || pkg.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Package Management</h1>
                <p className="text-slate-600 mt-1">Create and manage your travel packages</p>
              </div>
              <Link href="/operator/packages/create">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Package
                </Button>
              </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search packages by name or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter: {selectedFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedFilter('all')}>
                    All Packages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter('active')}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter('draft')}>
                    Drafts Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter('inactive')}>
                    Inactive Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={Package}
              label="Total Packages"
              value={stats.totalPackages}
              trend="+12% this month"
              color="blue"
            />
            <StatsCard
              icon={TrendingUp}
              label="Active Packages"
              value={stats.activePackages}
              trend="+8% active"
              color="green"
            />
            <StatsCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              trend="+15% growth"
              color="purple"
            />
            <StatsCard
              icon={Star}
              label="Avg Rating"
              value={stats.averageRating.toFixed(1)}
              trend="Excellent"
              color="orange"
            />
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PackageCard pkg={pkg} />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPackages.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No packages found</h3>
              <p className="text-slate-600 mb-6">Create your first package to get started</p>
              <Link href="/operator/packages/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Package
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}