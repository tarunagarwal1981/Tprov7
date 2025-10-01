'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plane
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/operator', icon: LayoutDashboard },
  { name: 'Packages', href: '/operator/packages', icon: Package, badge: 3 },
  { name: 'Bookings', href: '/operator/bookings', icon: Calendar, badge: 5 },
  { name: 'Travel Agents', href: '/operator/agents', icon: Users },
  { name: 'Analytics', href: '/operator/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/operator/messages', icon: MessageSquare, badge: 2 },
  { name: 'Settings', href: '/operator/settings', icon: Settings },
];

interface OperatorSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function OperatorSidebar({ collapsed, onToggle }: OperatorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/operator') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TravelPro
            </span>
          </Link>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative
                ${active 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
                  : 'text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <item.icon className={`w-5 h-5 relative z-10 flex-shrink-0 ${
                active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
              }`} />
              
              {!collapsed && (
                <>
                  <span className="flex-1 font-medium text-sm relative z-10">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full relative z-10">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg bg-slate-50`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            OP
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Operator User</p>
              <p className="text-xs text-slate-500 truncate">operator@test.com</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </motion.aside>
  );
}