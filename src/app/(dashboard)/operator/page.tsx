'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';

// Stats Card Component
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
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-3">{value}</p>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-slate-500">vs last month</span>
          </div>
        </div>
        <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Recent Booking Component
interface Booking {
  id: string;
  customer: string;
  package: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  date: string;
}

function RecentBookings({ bookings }: { bookings: Booking[] }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-slate-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Bookings</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900">{booking.customer}</p>
              <p className="text-sm text-slate-600">{booking.package}</p>
              <p className="text-xs text-slate-500 mt-1">{booking.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">${booking.amount.toLocaleString()}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${statusColors[booking.status]}`}>
                {booking.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    { name: 'Create Package', href: '/operator/packages/create', color: 'blue' },
    { name: 'View Bookings', href: '/operator/bookings', color: 'green' },
    { name: 'Manage Agents', href: '/operator/agents', color: 'purple' },
    { name: 'View Analytics', href: '/operator/analytics', color: 'orange' },
  ];

  const colors = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl p-6 border border-slate-200"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.a
            key={action.name}
            href={action.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 bg-gradient-to-br ${colors[action.color as keyof typeof colors]} text-white rounded-lg font-medium text-sm text-center transition-all shadow-soft hover:shadow-medium`}
          >
            {action.name}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

// Main Dashboard Component
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
    // Simulate API call
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
        package: 'Bali Adventure',
        amount: 2500,
        status: 'confirmed',
        date: 'Today, 2:30 PM',
      },
      {
        id: '2',
        customer: 'Sarah Johnson',
        package: 'European Tour',
        amount: 4200,
        status: 'pending',
        date: 'Today, 1:15 PM',
      },
      {
        id: '3',
        customer: 'Mike Wilson',
        package: 'Dubai Luxury',
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
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-3">
              <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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