import { 
  User, 
  UserRole, 
  Package, 
  PackageType, 
  PackageStatus, 
  DifficultyLevel,
  PackagePricing,
  GroupDiscount,
  SeasonalPricing,
  TaxBreakdown,
  FeeBreakdown,
  CancellationPolicy,
  RefundPolicy,
  ItineraryDay
} from './types';

// Additional interfaces for mock data
export interface Booking {
  id: string;
  packageId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travelAgentId?: string;
  travelAgentName?: string;
  bookingDate: Date;
  travelDate: Date;
  travelers: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  commissionRate: number;
  totalBookings: number;
  totalRevenue: number;
  isActive: boolean;
  joinedDate: Date;
  lastActivity: Date;
}

export interface DashboardStats {
  totalPackages: number;
  activeBookings: number;
  totalRevenue: number;
  totalAgents: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  averageRating: number;
  totalCustomers: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  customers: number;
  growth: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'booking' | 'payment' | 'inquiry' | 'agent_joined' | 'package_update';
  title: string;
  description: string;
  timestamp: Date;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Mock Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
  totalPackages: 24,
  activeBookings: 156,
  totalRevenue: 485750,
  totalAgents: 12,
  monthlyRevenue: 42500,
  monthlyGrowth: 15.2,
  averageRating: 4.7,
  totalCustomers: 89
};

// Mock Revenue Data
export const mockRevenueData: RevenueData[] = [
  { month: '2024-01', revenue: 35000, bookings: 45, customers: 38, growth: 8.5 },
  { month: '2024-02', revenue: 42000, bookings: 52, customers: 44, growth: 20.0 },
  { month: '2024-03', revenue: 38000, bookings: 48, customers: 41, growth: -9.5 },
  { month: '2024-04', revenue: 45000, bookings: 58, customers: 49, growth: 18.4 },
  { month: '2024-05', revenue: 52000, bookings: 65, customers: 55, growth: 15.6 },
  { month: '2024-06', revenue: 48000, bookings: 61, customers: 52, growth: -7.7 },
  { month: '2024-07', revenue: 55000, bookings: 68, customers: 58, growth: 14.6 },
  { month: '2024-08', revenue: 60000, bookings: 72, customers: 61, growth: 9.1 },
  { month: '2024-09', revenue: 58000, bookings: 70, customers: 59, growth: -3.3 },
  { month: '2024-10', revenue: 65000, bookings: 78, customers: 66, growth: 12.1 },
  { month: '2024-11', revenue: 70000, bookings: 82, customers: 70, growth: 7.7 },
  { month: '2024-12', revenue: 75000, bookings: 88, customers: 75, growth: 7.1 }
];

// Mock Activity Feed
export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 'act-001',
    type: 'booking',
    title: 'New booking received',
    description: 'Sarah Johnson booked "Bali Adventure Package" for 4 travelers',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    userName: 'Sarah Johnson'
  },
  {
    id: 'act-002',
    type: 'payment',
    title: 'Payment processed',
    description: 'Payment of $2,450 received for booking #BK-2024-001',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    userName: 'System'
  },
  {
    id: 'act-003',
    type: 'agent_joined',
    title: 'New travel agent joined',
    description: 'Michael Chen from "Wanderlust Travel" has joined the platform',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    userName: 'Michael Chen'
  },
  {
    id: 'act-004',
    type: 'inquiry',
    title: 'Package inquiry',
    description: 'Inquiry received for "European Grand Tour" from travel agent',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    userName: 'Emma Wilson'
  },
  {
    id: 'act-005',
    type: 'package_update',
    title: 'Package updated',
    description: 'Pricing updated for "Mountain Trek Experience"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    userName: 'Admin'
  },
  {
    id: 'act-006',
    type: 'booking',
    title: 'Booking confirmed',
    description: 'Booking #BK-2024-002 confirmed for "Tropical Paradise"',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    userName: 'David Lee'
  },
  {
    id: 'act-007',
    type: 'payment',
    title: 'Payment processed',
    description: 'Payment of $1,890 received for booking #BK-2024-003',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    userName: 'System'
  },
  {
    id: 'act-008',
    type: 'inquiry',
    title: 'Package inquiry',
    description: 'Inquiry received for "Cultural Heritage Tour" from customer',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    userName: 'Lisa Park'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'info',
    title: 'New booking alert',
    message: 'You have received a new booking for "Bali Adventure Package"',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    actionUrl: '/operator/bookings'
  },
  {
    id: 'notif-002',
    type: 'success',
    title: 'Payment received',
    message: 'Payment of $2,450 has been processed successfully',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    actionUrl: '/operator/payments'
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Low inventory',
    message: 'Only 2 spots remaining for "Mountain Trek Experience"',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actionUrl: '/operator/packages'
  },
  {
    id: 'notif-004',
    type: 'info',
    title: 'Agent performance',
    message: 'Monthly performance report is now available',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actionUrl: '/operator/analytics'
  },
  {
    id: 'notif-005',
    type: 'error',
    title: 'Payment failed',
    message: 'Payment for booking #BK-2024-005 failed to process',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    actionUrl: '/operator/bookings'
  }
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'bk-001',
    packageId: 'pkg-001',
    customerId: 'cust-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    customerPhone: '+1-555-0123',
    travelAgentId: 'agent-001',
    travelAgentName: 'Emma Wilson',
    bookingDate: new Date('2024-12-15'),
    travelDate: new Date('2024-12-25'),
    travelers: 4,
    status: 'confirmed',
    totalAmount: 2450,
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: 'bk-002',
    packageId: 'pkg-002',
    customerId: 'cust-002',
    customerName: 'David Lee',
    customerEmail: 'david.lee@email.com',
    customerPhone: '+1-555-0124',
    travelAgentId: 'agent-002',
    travelAgentName: 'Michael Chen',
    bookingDate: new Date('2024-12-14'),
    travelDate: new Date('2024-12-30'),
    travelers: 2,
    status: 'confirmed',
    totalAmount: 1890,
    createdAt: new Date('2024-12-14T14:20:00Z'),
    updatedAt: new Date('2024-12-14T14:20:00Z')
  },
  {
    id: 'bk-003',
    packageId: 'pkg-003',
    customerId: 'cust-003',
    customerName: 'Lisa Park',
    customerEmail: 'lisa.park@email.com',
    customerPhone: '+1-555-0125',
    bookingDate: new Date('2024-12-13'),
    travelDate: new Date('2025-01-10'),
    travelers: 1,
    status: 'pending',
    totalAmount: 1200,
    createdAt: new Date('2024-12-13T09:15:00Z'),
    updatedAt: new Date('2024-12-13T09:15:00Z')
  },
  {
    id: 'bk-004',
    packageId: 'pkg-001',
    customerId: 'cust-004',
    customerName: 'Robert Smith',
    customerEmail: 'robert.smith@email.com',
    customerPhone: '+1-555-0126',
    travelAgentId: 'agent-003',
    travelAgentName: 'Jessica Brown',
    bookingDate: new Date('2024-12-12'),
    travelDate: new Date('2025-01-15'),
    travelers: 3,
    status: 'confirmed',
    totalAmount: 1950,
    createdAt: new Date('2024-12-12T16:45:00Z'),
    updatedAt: new Date('2024-12-12T16:45:00Z')
  },
  {
    id: 'bk-005',
    packageId: 'pkg-004',
    customerId: 'cust-005',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.garcia@email.com',
    customerPhone: '+1-555-0127',
    bookingDate: new Date('2024-12-11'),
    travelDate: new Date('2025-02-01'),
    travelers: 2,
    status: 'cancelled',
    totalAmount: 1600,
    createdAt: new Date('2024-12-11T11:30:00Z'),
    updatedAt: new Date('2024-12-11T11:30:00Z')
  }
];

// Mock Travel Agents
export const mockTravelAgents: TravelAgent[] = [
  {
    id: 'agent-001',
    name: 'Emma Wilson',
    email: 'emma.wilson@wanderlust.com',
    phone: '+1-555-0201',
    company: 'Wanderlust Travel',
    commissionRate: 8.5,
    totalBookings: 45,
    totalRevenue: 125000,
    isActive: true,
    joinedDate: new Date('2024-01-15'),
    lastActivity: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: 'agent-002',
    name: 'Michael Chen',
    email: 'michael.chen@adventure.com',
    phone: '+1-555-0202',
    company: 'Adventure Seekers',
    commissionRate: 7.5,
    totalBookings: 38,
    totalRevenue: 98000,
    isActive: true,
    joinedDate: new Date('2024-02-20'),
    lastActivity: new Date('2024-12-14T14:20:00Z')
  },
  {
    id: 'agent-003',
    name: 'Jessica Brown',
    email: 'jessica.brown@explore.com',
    phone: '+1-555-0203',
    company: 'Explore More',
    commissionRate: 9.0,
    totalBookings: 52,
    totalRevenue: 145000,
    isActive: true,
    joinedDate: new Date('2024-01-10'),
    lastActivity: new Date('2024-12-12T16:45:00Z')
  },
  {
    id: 'agent-004',
    name: 'David Kim',
    email: 'david.kim@journey.com',
    phone: '+1-555-0204',
    company: 'Journey Masters',
    commissionRate: 8.0,
    totalBookings: 29,
    totalRevenue: 78000,
    isActive: true,
    joinedDate: new Date('2024-03-05'),
    lastActivity: new Date('2024-12-10T09:15:00Z')
  },
  {
    id: 'agent-005',
    name: 'Sarah Davis',
    email: 'sarah.davis@travel.com',
    phone: '+1-555-0205',
    company: 'Dream Travel',
    commissionRate: 7.0,
    totalBookings: 33,
    totalRevenue: 85000,
    isActive: false,
    joinedDate: new Date('2024-02-01'),
    lastActivity: new Date('2024-11-28T12:00:00Z')
  }
];

// Mock Packages (simplified for dashboard use)
export const mockPackages: Package[] = [
  {
    id: 'pkg-001',
    name: 'Bali Adventure Package',
    description: 'Experience the beauty of Bali with this comprehensive adventure package',
    type: PackageType.ADVENTURE,
    status: PackageStatus.ACTIVE,
    duration: { min: 7, max: 7, unit: 'days' },
    difficulty: DifficultyLevel.MODERATE,
    groupSize: { min: 2, max: 8, unit: 'people' },
    destinations: ['Bali', 'Ubud', 'Seminyak'],
    highlights: ['Temple visits', 'Beach activities', 'Cultural experiences'],
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide'],
    exclusions: ['International flights', 'Personal expenses'],
    pricing: {
      basePrice: 1200,
      currency: 'USD',
      groupDiscounts: [
        { minGroupSize: 4, discountPercentage: 10 },
        { minGroupSize: 8, discountPercentage: 15 }
      ],
      seasonalPricing: [
        { season: 'Peak', months: [6, 7, 8], priceMultiplier: 1.3 },
        { season: 'Off-Peak', months: [1, 2, 3], priceMultiplier: 0.8 }
      ]
    },
    images: ['/images/bali-1.jpg', '/images/bali-2.jpg'],
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'pkg-002',
    name: 'European Grand Tour',
    description: 'Explore the best of Europe in this comprehensive 14-day tour',
    type: PackageType.CULTURAL,
    status: PackageStatus.ACTIVE,
    duration: { min: 14, max: 14, unit: 'days' },
    difficulty: DifficultyLevel.EASY,
    groupSize: { min: 6, max: 20, unit: 'people' },
    destinations: ['Paris', 'Rome', 'Barcelona', 'Amsterdam'],
    highlights: ['Historical sites', 'Museums', 'Local cuisine', 'City tours'],
    inclusions: ['Accommodation', 'Breakfast', 'Transportation', 'Museum passes'],
    exclusions: ['Lunch and dinner', 'Personal expenses', 'Optional activities'],
    pricing: {
      basePrice: 2500,
      currency: 'USD',
      groupDiscounts: [
        { minGroupSize: 6, discountPercentage: 12 },
        { minGroupSize: 12, discountPercentage: 18 }
      ],
      seasonalPricing: [
        { season: 'Peak', months: [6, 7, 8], priceMultiplier: 1.4 },
        { season: 'Off-Peak', months: [11, 12, 1], priceMultiplier: 0.7 }
      ]
    },
    images: ['/images/europe-1.jpg', '/images/europe-2.jpg'],
    rating: 4.6,
    reviewCount: 89,
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-11-15')
  }
];

// Export all mock data as a single object for easy access
export const mockData = {
  dashboardStats: mockDashboardStats,
  revenueData: mockRevenueData,
  activityFeed: mockActivityFeed,
  notifications: mockNotifications,
  bookings: mockBookings,
  travelAgents: mockTravelAgents,
  packages: mockPackages
};
