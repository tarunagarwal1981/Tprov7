// Agent-specific services for leads, itineraries, and package browsing

import { supabase } from '@/lib/supabase';
import { 
  Lead, 
  Itinerary, 
  AgentStats, 
  AgentDashboardData, 
  PackageSearchFilters,
  BookingRequest,
  Commission,
  AgentActivity,
  AgentNotification
} from '@/lib/types/agent';

// Mock delay function to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for development
const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    customerName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    destination: 'Bali, Indonesia',
    budget: 3000,
    tripType: 'ADVENTURE',
    travelers: 2,
    duration: 7,
    preferredDates: {
      start: new Date('2024-03-15'),
      end: new Date('2024-03-22')
    },
    preferences: ['Beach activities', 'Cultural experiences', 'Adventure sports'],
    status: 'NEW',
    source: 'MARKETPLACE',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    agentId: 'agent-001',
    notes: 'Interested in water sports and local cuisine',
    communicationLog: []
  },
  {
    id: 'lead-002',
    customerName: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1-555-0456',
    destination: 'Paris, France',
    budget: 5000,
    tripType: 'CULTURAL',
    travelers: 2,
    duration: 10,
    preferredDates: {
      start: new Date('2024-04-20'),
      end: new Date('2024-04-30')
    },
    preferences: ['Museums', 'Fine dining', 'Historical sites'],
    status: 'CONTACTED',
    source: 'REFERRAL',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    agentId: 'agent-001',
    notes: 'First-time visitors to Europe',
    communicationLog: []
  }
];

const mockItineraries: Itinerary[] = [
  {
    id: 'itinerary-001',
    leadId: 'lead-001',
    agentId: 'agent-001',
    title: 'Bali Adventure Package',
    description: '7-day adventure package including water sports and cultural experiences',
    status: 'DRAFT',
    totalCost: 2800,
    agentCommission: 280,
    customerPrice: 3000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    days: [],
    packages: [],
    customItems: [],
    notes: 'Waiting for client approval'
  }
];

const mockAgentStats: AgentStats = {
  totalLeads: 45,
  activeLeads: 12,
  totalItineraries: 28,
  bookedItineraries: 18,
  monthlyCommission: 8750,
  totalRevenue: 125000,
  averageRating: 4.9,
  conversionRate: 64.3,
  leadsGrowth: 12.5,
  revenueGrowth: 18.2,
  commissionGrowth: 15.8,
  ratingGrowth: 2.1
};

export class AgentService {
  // Lead Management
  async getLeads(agentId: string, filters?: { status?: string }): Promise<{ data: Lead[]; success: boolean; error?: string }> {
    try {
      await delay(500);
      
      let filteredLeads = mockLeads.filter(lead => lead.agentId === agentId);
      
      if (filters?.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }
      
      return {
        data: filteredLeads,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch leads'
      };
    }
  }

  async getLeadById(leadId: string): Promise<{ data: Lead | null; success: boolean; error?: string }> {
    try {
      await delay(300);
      
      const lead = mockLeads.find(l => l.id === leadId);
      
      return {
        data: lead || null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to fetch lead'
      };
    }
  }

  async updateLeadStatus(leadId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      await delay(400);
      
      const leadIndex = mockLeads.findIndex(l => l.id === leadId);
      if (leadIndex !== -1) {
        mockLeads[leadIndex].status = status as any;
        mockLeads[leadIndex].updatedAt = new Date();
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update lead status'
      };
    }
  }

  // Itinerary Management
  async getItineraries(agentId: string, filters?: { status?: string }): Promise<{ data: Itinerary[]; success: boolean; error?: string }> {
    try {
      await delay(500);
      
      let filteredItineraries = mockItineraries.filter(itinerary => itinerary.agentId === agentId);
      
      if (filters?.status) {
        filteredItineraries = filteredItineraries.filter(itinerary => itinerary.status === filters.status);
      }
      
      return {
        data: filteredItineraries,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch itineraries'
      };
    }
  }

  async createItinerary(leadId: string, agentId: string, itineraryData: Partial<Itinerary>): Promise<{ data: Itinerary | null; success: boolean; error?: string }> {
    try {
      await delay(600);
      
      const newItinerary: Itinerary = {
        id: `itinerary-${Date.now()}`,
        leadId,
        agentId,
        title: itineraryData.title || 'New Itinerary',
        description: itineraryData.description,
        status: 'DRAFT',
        totalCost: 0,
        agentCommission: 0,
        customerPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        days: [],
        packages: [],
        customItems: [],
        notes: itineraryData.notes
      };
      
      mockItineraries.push(newItinerary);
      
      return {
        data: newItinerary,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to create itinerary'
      };
    }
  }

  // Package Browsing - Get all active packages from all operators
  async searchPackages(filters: PackageSearchFilters): Promise<{ data: any[]; success: boolean; error?: string }> {
    try {
      await delay(500);
      
      // Query packages from database with filters - get ALL active packages from ALL operators
      let query = supabase
        .from('packages')
        .select(`
          id,
          title,
          description,
          type,
          pricing,
          destinations,
          duration,
          group_size,
          difficulty,
          tags,
          rating,
          review_count,
          images,
          inclusions,
          exclusions,
          status,
          created_at,
          tour_operators!inner(
            id,
            company_name,
            user_id
          )
        `)
        .eq('status', 'ACTIVE'); // Only get active packages

      // Apply filters
      if (filters.destination) {
        query = query.contains('destinations', [filters.destination]);
      }
      
      if (filters.tripType) {
        query = query.contains('tags', [filters.tripType]);
      }
      
      if (filters.minPrice) {
        query = query.gte('pricing->adult', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('pricing->adult', filters.maxPrice);
      }
      
      if (filters.duration) {
        query = query.eq('duration->days', filters.duration);
      }
      
      if (filters.operatorId) {
        query = query.eq('tour_operator_id', filters.operatorId);
      }
      
      if (filters.rating) {
        query = query.gte('rating', filters.rating);
      }

      // Order by rating and created date for better results
      query = query.order('rating', { ascending: false })
                  .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to match expected format
      const transformedPackages = data?.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        type: pkg.type,
        pricing: pkg.pricing,
        destinations: pkg.destinations,
        duration: pkg.duration,
        groupSize: pkg.group_size,
        difficulty: pkg.difficulty,
        tags: pkg.tags,
        rating: pkg.rating,
        reviewCount: pkg.review_count,
        images: pkg.images,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        status: pkg.status,
        operatorName: pkg.tour_operators.company_name,
        operatorId: pkg.tour_operators.id,
        createdAt: pkg.created_at
      })) || [];

      return {
        data: transformedPackages,
        success: true
      };
    } catch (error) {
      console.error('Error searching packages:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to search packages'
      };
    }
  }

  // Get packages for itinerary creation
  async getPackagesForItinerary(filters: {
    destination?: string;
    tripType?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    operatorId?: string;
    rating?: number;
  } = {}): Promise<{ data: any[]; success: boolean; error?: string }> {
    try {
      // Use the same searchPackages method but with specific filters for itinerary creation
      return await this.searchPackages(filters);
    } catch (error) {
      console.error('Error getting packages for itinerary:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to get packages for itinerary'
      };
    }
  }

  // Dashboard Data
  async getDashboardData(agentId: string): Promise<{ data: AgentDashboardData; success: boolean; error?: string }> {
    try {
      await delay(600);
      
      const dashboardData: AgentDashboardData = {
        stats: mockAgentStats,
        recentLeads: mockLeads.slice(0, 5),
        recentItineraries: mockItineraries.slice(0, 5),
        topPackages: [
          {
            id: 'pkg-001',
            name: 'Bali Adventure Package',
            destination: 'Bali, Indonesia',
            operatorName: 'Bali Adventures Co.',
            price: 1200,
            rating: 4.8,
            bookings: 45,
            views: 120,
            availability: true
          }
        ],
        recentActivity: [
          {
            id: 'activity-001',
            type: 'LEAD_CREATED',
            title: 'New Lead Received',
            description: 'Sarah Johnson - Bali Adventure',
            timestamp: new Date('2024-01-15'),
            leadId: 'lead-001'
          }
        ],
        notifications: [
          {
            id: 'notif-001',
            type: 'LEAD_ASSIGNED',
            title: 'New Lead Assignment',
            message: 'You have been assigned a new lead for Bali adventure',
            isRead: false,
            createdAt: new Date('2024-01-15'),
            priority: 'HIGH',
            actionUrl: '/agent/leads/lead-001'
          }
        ]
      };
      
      return {
        data: dashboardData,
        success: true
      };
    } catch (error) {
      return {
        data: {
          stats: mockAgentStats,
          recentLeads: [],
          recentItineraries: [],
          topPackages: [],
          recentActivity: [],
          notifications: []
        },
        success: false,
        error: 'Failed to fetch dashboard data'
      };
    }
  }

  // Booking Requests
  async createBookingRequest(requestData: Partial<BookingRequest>): Promise<{ data: BookingRequest | null; success: boolean; error?: string }> {
    try {
      await delay(500);
      
      const newRequest: BookingRequest = {
        id: `request-${Date.now()}`,
        itineraryId: requestData.itineraryId!,
        packageId: requestData.packageId!,
        operatorId: requestData.operatorId!,
        agentId: requestData.agentId!,
        quantity: requestData.quantity || 1,
        requestedDates: requestData.requestedDates!,
        specialRequests: requestData.specialRequests,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return {
        data: newRequest,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: 'Failed to create booking request'
      };
    }
  }

  // Commission Tracking
  async getCommissions(agentId: string): Promise<{ data: Commission[]; success: boolean; error?: string }> {
    try {
      await delay(400);
      
      const mockCommissions: Commission[] = [
        {
          id: 'comm-001',
          agentId,
          itineraryId: 'itinerary-001',
          bookingId: 'booking-001',
          amount: 280,
          percentage: 10,
          status: 'APPROVED',
          createdAt: new Date('2024-01-15'),
          paidAt: new Date('2024-01-20'),
          notes: 'Bali Adventure Package commission'
        }
      ];
      
      return {
        data: mockCommissions,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch commissions'
      };
    }
  }

  // Leads Marketplace
  async getMarketplaceLeads(filters?: {
    destination?: string;
    tripType?: string;
    minBudget?: number;
    maxBudget?: number;
    status?: string;
  }): Promise<{ data: any[]; success: boolean; error?: string }> {
    try {
      let query = supabase
        .from('leads_marketplace')
        .select(`
          *,
          admin:users!leads_marketplace_admin_id_fkey(
            id,
            name,
            email
          )
        `)
        .eq('status', 'AVAILABLE');

      // Apply filters
      if (filters?.destination) {
        query = query.ilike('destination', `%${filters.destination}%`);
      }
      
      if (filters?.tripType) {
        query = query.eq('trip_type', filters.tripType);
      }
      
      if (filters?.minBudget) {
        query = query.gte('budget', filters.minBudget);
      }
      
      if (filters?.maxBudget) {
        query = query.lte('budget', filters.maxBudget);
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching marketplace leads:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch marketplace leads'
      };
    }
  }

  // Purchase Lead
  async purchaseLead(leadId: string, agentId: string): Promise<{ data: any; success: boolean; error?: string }> {
    try {
      // First, get the lead details
      const { data: lead, error: leadError } = await supabase
        .from('leads_marketplace')
        .select('*')
        .eq('id', leadId)
        .eq('status', 'AVAILABLE')
        .single();

      if (leadError || !lead) {
        throw new Error('Lead not found or no longer available');
      }

      // Create purchased lead record
      const { data: purchasedLead, error: purchaseError } = await supabase
        .from('purchased_leads')
        .insert({
          lead_id: leadId,
          agent_id: agentId,
          purchase_price: lead.lead_price,
          commission_rate: lead.commission_rate,
          status: 'PURCHASED'
        })
        .select()
        .single();

      if (purchaseError) {
        throw purchaseError;
      }

      // Update lead status to purchased
      const { error: updateError } = await supabase
        .from('leads_marketplace')
        .update({ status: 'PURCHASED' })
        .eq('id', leadId);

      if (updateError) {
        throw updateError;
      }

      return {
        data: purchasedLead,
        success: true
      };
    } catch (error) {
      console.error('Error purchasing lead:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to purchase lead'
      };
    }
  }

  // Get Purchased Leads
  async getPurchasedLeads(agentId: string): Promise<{ data: any[]; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('purchased_leads')
        .select(`
          *,
          lead:leads_marketplace!purchased_leads_lead_id_fkey(
            *
          )
        `)
        .eq('agent_id', agentId)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching purchased leads:', error);
      return {
        data: [],
        success: false,
        error: 'Failed to fetch purchased leads'
      };
    }
  }

  // Create Itinerary
  async createItinerary(itineraryData: {
    leadId: string;
    agentId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    days: any[];
    selectedPackages: any[];
    totalCost: number;
    agentCommission: number;
    customerPrice: number;
  }): Promise<{ data: any; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          lead_id: itineraryData.leadId,
          agent_id: itineraryData.agentId,
          title: itineraryData.title,
          description: itineraryData.description,
          start_date: itineraryData.startDate,
          end_date: itineraryData.endDate,
          duration_days: itineraryData.days.length,
          total_cost: itineraryData.totalCost,
          agent_commission: itineraryData.agentCommission,
          customer_price: itineraryData.customerPrice,
          status: 'DRAFT'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create itinerary days
      if (itineraryData.days.length > 0) {
        const daysData = itineraryData.days.map((day, index) => ({
          itinerary_id: data.id,
          day_number: index + 1,
          date: day.date,
          location: day.location,
          accommodation: day.accommodation,
          meals: day.meals || [],
          transportation: day.transportation,
          notes: day.notes
        }));

        const { error: daysError } = await supabase
          .from('itinerary_days')
          .insert(daysData);

        if (daysError) {
          throw daysError;
        }
      }

      // Create itinerary packages
      if (itineraryData.selectedPackages.length > 0) {
        const packagesData = itineraryData.selectedPackages.map(pkg => ({
          itinerary_id: data.id,
          package_id: pkg.id,
          package_name: pkg.title,
          operator_id: pkg.operatorId,
          operator_name: pkg.operatorName,
          quantity: 1,
          unit_price: pkg.pricing?.adult || pkg.pricing?.basePrice || 0,
          total_price: pkg.pricing?.adult || pkg.pricing?.basePrice || 0,
          status: 'PENDING'
        }));

        const { error: packagesError } = await supabase
          .from('itinerary_packages')
          .insert(packagesData);

        if (packagesError) {
          throw packagesError;
        }
      }

      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('Error creating itinerary:', error);
      return {
        data: null,
        success: false,
        error: 'Failed to create itinerary'
      };
    }
  }

  // Send Itinerary
  async sendItinerary(itineraryId: string, method: 'email' | 'whatsapp'): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status: 'SENT',
        sent_at: new Date()
      };

      if (method === 'email') {
        updateData.sent_via_email = true;
        updateData.email_sent_at = new Date();
      } else if (method === 'whatsapp') {
        updateData.sent_via_whatsapp = true;
        updateData.whatsapp_sent_at = new Date();
      }

      const { error } = await supabase
        .from('itineraries')
        .update(updateData)
        .eq('id', itineraryId);

      if (error) {
        throw error;
      }

      return {
        success: true
      };
    } catch (error) {
      console.error(`Error sending itinerary via ${method}:`, error);
      return {
        success: false,
        error: `Failed to send itinerary via ${method}`
      };
    }
  }
}

// Export singleton instance
export const agentService = new AgentService();
