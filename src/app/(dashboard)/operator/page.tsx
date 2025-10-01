'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';

// Beautiful Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  index: number;
}

function StatsCard({ title, value, change, icon: Icon, color, index }: StatsCardProps) {
  const colors = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      light: 'from-blue-50 to-blue-100',
      text: 'text-blue-600'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      light: 'from-green-50 to-green-100',
      text: 'text-green-600'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      light: 'from-purple-50 to-purple-100',
      text: 'text-purple-600'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      light: 'from-orange-50 to-orange-100',
      text: 'text-orange-600'
    },
  };

  const isPositive = change >= 0;
  const selectedColor = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Hover gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedColor.light} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`} />
        
        <div className="relative">
          {/* Header with Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {value}
              </p>
            </div>
            
            {/* Icon Container - Fixed Size */}
            <div className={`p-3 bg-gradient-to-br ${selectedColor.gradient} rounded-xl shadow-md`}>
              <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Change Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
              isPositive ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className={`text-sm font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
            <span className="text-sm text-slate-500">vs last month</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Booking Card
interface Booking {
  id: string;
  customer: string;
  package: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  date: string;
}

function RecentBookings({ bookings }: { bookings: Booking[] }) {
  const statusConfig = {
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: CheckCircle
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: Clock
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: XCircle
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
          View All →
        </button>
      </div>
      
      <div className="space-y-3">
        {bookings.map((booking, index) => {
          const StatusIcon = statusConfig[booking.status].icon;
          
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 4 }}
              className="group"
            >
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-100">
                {/* Customer Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    {booking.customer.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {booking.customer}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      {booking.package}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {booking.date}
                    </p>
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-bold text-slate-900 mb-2">
                    ${booking.amount.toLocaleString()}
                  </p>
                  <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg ${statusConfig[booking.status].bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusConfig[booking.status].text}`} />
                    <span className={`text-xs font-semibold uppercase ${statusConfig[booking.status].text}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Quick Actions
function QuickActions() {
  const actions = [
    { 
      name: 'Create Package', 
      href: '/operator/packages/create', 
      gradient: 'from-blue-500 to-blue-600',
      icon: Package,
      description: 'Add new travel package'
    },
    { 
      name: 'View Bookings', 
      href: '/operator/bookings', 
      gradient: 'from-green-500 to-green-600',
      icon: Calendar,
      description: 'Manage all bookings'
    },
    { 
      name: 'Manage Agents', 
      href: '/operator/agents', 
      gradient: 'from-purple-500 to-purple-600',
      icon: Users,
      description: 'View travel agents'
    },
    { 
      name: 'View Analytics', 
      href: '/operator/analytics', 
      gradient: 'from-orange-500 to-orange-600',
      icon: TrendingUp,
      description: 'Performance insights'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <motion.a
              key={action.name}
              href={action.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group block relative p-4 bg-gradient-to-br ${action.gradient} rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300`}
            >
              <div className="relative flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <ActionIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white mb-0.5">
                    {action.name}
                  </p>
                  <p className="text-xs text-white/80">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

// Main Dashboard
export default function OperatorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPackages: 0,
    totalBookings: 0,
    activeAgents: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setStats({
      totalRevenue: 125430,
      totalPackages: 24,
      totalBookings: 156,
      activeAgents: 45,
    });

    setRecentBookings([
      {
        id: '1',
        customer: 'John Smith',
        package: 'Bali Adventure Package',
        amount: 2500,
        status: 'confirmed',
        date: 'Today, 2:30 PM',
      },
      {
        id: '2',
        customer: 'Sarah Johnson',
        package: 'European Grand Tour',
        amount: 4200,
        status: 'pending',
        date: 'Today, 1:15 PM',
      },
      {
        id: '3',
        customer: 'Mike Wilson',
        package: 'Dubai Luxury Experience',
        amount: 3800,
        status: 'confirmed',
        date: 'Yesterday, 5:45 PM',
      },
    ]);
  }, []);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Dashboard Overview
                </h1>
                <p className="text-slate-600 mt-1">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
              <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              change={12.5}
              icon={DollarSign}
              color="green"
              index={0}
            />
            <StatsCard
              title="Active Packages"
              value={stats.totalPackages}
              change={8.2}
              icon={Package}
              color="blue"
              index={1}
            />
            <StatsCard
              title="Total Bookings"
              value={stats.totalBookings}
              change={15.3}
              icon={Calendar}
              color="purple"
              index={2}
            />
            <StatsCard
              title="Active Agents"
              value={stats.activeAgents}
              change={5.7}
              icon={Users}
              color="orange"
              index={3}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentBookings bookings={recentBookings} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}