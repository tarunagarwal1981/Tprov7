// Agent-specific types and interfaces

export interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  destination: string;
  budget: number;
  tripType: 'ADVENTURE' | 'CULTURAL' | 'BEACH' | 'CITY_BREAK' | 'LUXURY' | 'BUDGET';
  travelers: number;
  duration: number; // in days
  preferredDates: {
    start: Date;
    end: Date;
  };
  preferences: string[];
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  source: 'MARKETPLACE' | 'REFERRAL' | 'DIRECT' | 'SOCIAL_MEDIA';
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  notes?: string;
  communicationLog: CommunicationLogEntry[];
}

export interface CommunicationLogEntry {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE';
  content: string;
  timestamp: Date;
  agentId: string;
}

export interface Itinerary {
  id: string;
  leadId: string;
  agentId: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'SENT' | 'REVISED' | 'APPROVED' | 'BOOKED' | 'CANCELLED';
  totalCost: number;
  agentCommission: number;
  customerPrice: number;
  createdAt: Date;
  updatedAt: Date;
  days: ItineraryDay[];
  packages: ItineraryPackage[];
  customItems: CustomItineraryItem[];
  notes?: string;
  clientFeedback?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: Date;
  location: string;
  activities: ItineraryActivity[];
  accommodation?: string;
  meals: string[];
  transportation?: string;
  notes?: string;
}

export interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // in hours
  cost: number;
  type: 'PACKAGE' | 'CUSTOM';
  packageId?: string;
  timeSlot: string;
  location: string;
}

export interface ItineraryPackage {
  id: string;
  packageId: string;
  packageName: string;
  operatorId: string;
  operatorName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  bookingRequestId?: string;
  notes?: string;
}

export interface CustomItineraryItem {
  id: string;
  name: string;
  description: string;
  type: 'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'ACTIVITY' | 'MEAL' | 'OTHER';
  cost: number;
  supplier?: string;
  notes?: string;
}

export interface PackageSearchFilters {
  destination?: string;
  tripType?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  operatorId?: string;
  rating?: number;
  availability?: boolean;
}

export interface AgentStats {
  totalLeads: number;
  activeLeads: number;
  totalItineraries: number;
  bookedItineraries: number;
  monthlyCommission: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
  leadsGrowth: number;
  revenueGrowth: number;
  commissionGrowth: number;
  ratingGrowth: number;
}

export interface AgentDashboardData {
  stats: AgentStats;
  recentLeads: Lead[];
  recentItineraries: Itinerary[];
  topPackages: PackageWithStats[];
  recentActivity: AgentActivity[];
  notifications: AgentNotification[];
}

export interface PackageWithStats {
  id: string;
  name: string;
  destination: string;
  operatorName: string;
  price: number;
  rating: number;
  bookings: number;
  views: number;
  availability: boolean;
  imageUrl?: string;
}

export interface AgentActivity {
  id: string;
  type: 'LEAD_CREATED' | 'ITINERARY_CREATED' | 'BOOKING_CONFIRMED' | 'COMMISSION_EARNED' | 'CUSTOMER_FEEDBACK';
  title: string;
  description: string;
  timestamp: Date;
  leadId?: string;
  itineraryId?: string;
  amount?: number;
}

export interface AgentNotification {
  id: string;
  type: 'LEAD_ASSIGNED' | 'BOOKING_CONFIRMED' | 'COMMISSION_PAID' | 'CUSTOMER_MESSAGE' | 'SYSTEM_UPDATE';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionUrl?: string;
}

export interface BookingRequest {
  id: string;
  itineraryId: string;
  packageId: string;
  operatorId: string;
  agentId: string;
  quantity: number;
  requestedDates: {
    start: Date;
    end: Date;
  };
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  responseMessage?: string;
  confirmedPrice?: number;
}

export interface Commission {
  id: string;
  agentId: string;
  itineraryId: string;
  bookingId: string;
  amount: number;
  percentage: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  createdAt: Date;
  paidAt?: Date;
  notes?: string;
}
