import { 
  mockDashboardStats, 
  mockRevenueData, 
  mockActivityFeed, 
  mockNotifications,
  mockBookings,
  mockTravelAgents,
  DashboardStats,
  RevenueData,
  ActivityFeedItem,
  Notification,
  Booking,
  TravelAgent
} from '../mockData';
import { supabase } from '../supabase';
import { PackageService } from './packageService';

// Re-export types for external use
export type { DashboardStats, RevenueData, ActivityFeedItem, Notification, Booking, TravelAgent };

// Service response interfaces
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentBookings: Booking[];
  topPackages: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  recentActivity: ActivityFeedItem[];
  notifications: Notification[];
}

export interface PerformanceMetrics {
  revenueGrowth: number;
  bookingGrowth: number;
  customerGrowth: number;
  agentGrowth: number;
  conversionRate: number;
  averageBookingValue: number;
  customerSatisfaction: number;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

// Mock delay function to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard Service Class
export class DashboardService {
  private stats: DashboardStats = { ...mockDashboardStats };
  private revenueData: RevenueData[] = [...mockRevenueData];
  private activityFeed: ActivityFeedItem[] = [...mockActivityFeed];
  private notifications: Notification[] = [...mockNotifications];
  private bookings: Booking[] = [...mockBookings];
  private agents: TravelAgent[] = [...mockTravelAgents];

  // Get dashboard overview
  async getDashboardOverview(): Promise<ServiceResponse<DashboardOverview>> {
    try {
      await delay(600);

      const recentBookings = this.bookings
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      const topPackages = [
        {
          id: 'pkg-001',
          name: 'Bali Adventure Package',
          bookings: 45,
          revenue: 58455,
          rating: 4.8
        },
        {
          id: 'pkg-002',
          name: 'European Grand Tour',
          bookings: 32,
          revenue: 79968,
          rating: 4.6
        },
        {
          id: 'pkg-003',
          name: 'Mountain Trek Experience',
          bookings: 28,
          revenue: 25120,
          rating: 4.9
        }
      ];

      const recentActivity = this.activityFeed
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      const unreadNotifications = this.notifications.filter(n => !n.isRead);

      return {
        data: {
          stats: this.stats,
          recentBookings,
          topPackages,
          recentActivity,
          notifications: unreadNotifications
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          stats: this.stats,
          recentBookings: [],
          topPackages: [],
          recentActivity: [],
          notifications: []
        },
        success: false,
        error: 'Failed to fetch dashboard overview'
      };
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      await delay(300);

      return {
        data: this.stats,
        success: true
      };
    } catch (error) {
      return {
        data: this.stats,
        success: false,
        error: 'Failed to fetch dashboard statistics'
      };
    }
  }

  // Get real dashboard statistics from database
  async getRealDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      // Get package statistics
      const packageService = new PackageService();
      const packageStatsResponse = await packageService.getPackageStats();
      
      if (!packageStatsResponse.success) {
        throw new Error(packageStatsResponse.error || 'Failed to fetch package stats');
      }

      const packageStats = packageStatsResponse.data;

      // Get booking statistics
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('status, pricing, created_at');

      if (bookingError) {
        console.warn('Failed to fetch bookings:', bookingError);
      }

      // Calculate booking stats
      const totalBookings = bookings?.length || 0;
      const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED').length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'PENDING').length || 0;
      
      // Calculate revenue from confirmed bookings
      const totalRevenue = bookings?.filter(b => b.status === 'CONFIRMED').reduce((sum, booking) => {
        const pricing = booking.pricing as any;
        return sum + (pricing?.totalAmount || pricing?.basePrice || 0);
      }, 0) || 0;

      // Get user statistics (travel agents)
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('role', 'TRAVEL_AGENT');

      if (userError) {
        console.warn('Failed to fetch users:', userError);
      }

      const totalAgents = users?.length || 0;
      const activeAgents = users?.filter(u => u.is_active).length || 0;

      // Calculate growth percentages (mock for now - would need historical data)
      const revenueGrowth = 15.2; // Mock value - would calculate from historical data
      const bookingGrowth = 8.5; // Mock value
      const customerGrowth = 12.3; // Mock value
      const agentGrowth = 5.7; // Mock value

      const realStats: DashboardStats = {
        totalPackages: packageStats.totalPackages,
        activeBookings: confirmedBookings,
        totalRevenue: totalRevenue,
        totalAgents: totalAgents,
        monthlyRevenue: Math.floor(totalRevenue / 12), // Mock monthly calculation
        monthlyGrowth: 15.2, // Mock growth percentage
        averageRating: packageStats.averageRating,
        totalCustomers: Math.floor(totalBookings * 1.2), // Mock customer calculation
      };

      return {
        data: realStats,
        success: true
      };
    } catch (error) {
      console.error('Error fetching real dashboard stats:', error);
      return {
        data: this.stats, // Fallback to mock stats
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics'
      };
    }
  }

  // Get revenue data
  async getRevenueData(timeRange?: TimeRange): Promise<ServiceResponse<RevenueData[]>> {
    try {
      await delay(400);

      let data = [...this.revenueData];

      if (timeRange) {
        data = data.filter(item => {
          const itemDate = new Date(item.month);
          return itemDate >= timeRange.startDate && itemDate <= timeRange.endDate;
        });
      }

      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch revenue data'
      };
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<ServiceResponse<PerformanceMetrics>> {
    try {
      await delay(500);

      // Calculate growth rates (mock calculations)
      const currentMonth = this.revenueData[this.revenueData.length - 1];
      const previousMonth = this.revenueData[this.revenueData.length - 2];
      
      const revenueGrowth = previousMonth ? 
        ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;
      
      const bookingGrowth = previousMonth ? 
        ((currentMonth.bookings - previousMonth.bookings) / previousMonth.bookings) * 100 : 0;

      const customerGrowth = 12.5; // Mock value
      const agentGrowth = 8.3; // Mock value
      const conversionRate = 18.7; // Mock value
      const averageBookingValue = 1850; // Mock value
      const customerSatisfaction = 4.8; // Mock value

      return {
        data: {
          revenueGrowth,
          bookingGrowth,
          customerGrowth,
          agentGrowth,
          conversionRate,
          averageBookingValue,
          customerSatisfaction
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          revenueGrowth: 0,
          bookingGrowth: 0,
          customerGrowth: 0,
          agentGrowth: 0,
          conversionRate: 0,
          averageBookingValue: 0,
          customerSatisfaction: 0
        },
        success: false,
        error: 'Failed to fetch performance metrics'
      };
    }
  }

  // Get recent activity feed
  async getRecentActivity(limit: number = 10): Promise<ServiceResponse<ActivityFeedItem[]>> {
    try {
      await delay(300);

      const recentActivity = this.activityFeed
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return {
        data: recentActivity,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch recent activity'
      };
    }
  }

  // Get notifications
  async getNotifications(unreadOnly: boolean = false): Promise<ServiceResponse<Notification[]>> {
    try {
      await delay(200);

      let notifications = [...this.notifications];

      if (unreadOnly) {
        notifications = notifications.filter(n => !n.isRead);
      }

      // Sort by creation date (newest first)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        data: notifications,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        error: 'Failed to fetch notifications'
      };
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ServiceResponse<boolean>> {
    try {
      await delay(200);

      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex === -1) {
        return {
          data: false,
          success: false,
          error: 'Notification not found'
        };
      }

      this.notifications[notificationIndex].isRead = true;

      return {
        data: true,
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        error: 'Failed to mark notification as read'
      };
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<ServiceResponse<boolean>> {
    try {
      await delay(300);

      this.notifications.forEach(notification => {
        notification.isRead = true;
      });

      return {
        data: true,
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      return {
        data: false,
        success: false,
        error: 'Failed to mark all notifications as read'
      };
    }
  }

  // Get booking statistics
  async getBookingStats(): Promise<ServiceResponse<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    monthlyBookings: number;
    monthlyGrowth: number;
  }>> {
    try {
      await delay(400);

      const totalBookings = this.bookings.length;
      const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
      const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled').length;
      const totalRevenue = this.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Mock monthly calculations
      const monthlyBookings = 12;
      const monthlyGrowth = 8.5;

      return {
        data: {
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          totalRevenue,
          averageBookingValue,
          monthlyBookings,
          monthlyGrowth
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          monthlyBookings: 0,
          monthlyGrowth: 0
        },
        success: false,
        error: 'Failed to fetch booking statistics'
      };
    }
  }

  // Get agent statistics
  async getAgentStats(): Promise<ServiceResponse<{
    totalAgents: number;
    activeAgents: number;
    topAgents: TravelAgent[];
    averageCommission: number;
    totalAgentRevenue: number;
  }>> {
    try {
      await delay(400);

      const totalAgents = this.agents.length;
      const activeAgents = this.agents.filter(a => a.isActive).length;
      const topAgents = this.agents
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
      const averageCommission = this.agents.reduce((sum, agent) => sum + agent.commissionRate, 0) / totalAgents;
      const totalAgentRevenue = this.agents.reduce((sum, agent) => sum + agent.totalRevenue, 0);

      return {
        data: {
          totalAgents,
          activeAgents,
          topAgents,
          averageCommission,
          totalAgentRevenue
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          totalAgents: 0,
          activeAgents: 0,
          topAgents: [],
          averageCommission: 0,
          totalAgentRevenue: 0
        },
        success: false,
        error: 'Failed to fetch agent statistics'
      };
    }
  }

  // Get monthly trends
  async getMonthlyTrends(months: number = 12): Promise<ServiceResponse<{
    revenue: Array<{ month: string; value: number }>;
    bookings: Array<{ month: string; value: number }>;
    customers: Array<{ month: string; value: number }>;
  }>> {
    try {
      await delay(500);

      const recentData = this.revenueData.slice(-months);
      
      const revenue = recentData.map(item => ({
        month: item.month,
        value: item.revenue
      }));

      const bookings = recentData.map(item => ({
        month: item.month,
        value: item.bookings
      }));

      // Mock customer data
      const customers = recentData.map(item => ({
        month: item.month,
        value: Math.floor(item.bookings * 1.2) // Mock calculation
      }));

      return {
        data: {
          revenue,
          bookings,
          customers
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          revenue: [],
          bookings: [],
          customers: []
        },
        success: false,
        error: 'Failed to fetch monthly trends'
      };
    }
  }

  // Update dashboard statistics (for real-time updates)
  async updateStats(updates: Partial<DashboardStats>): Promise<ServiceResponse<DashboardStats>> {
    try {
      await delay(200);

      this.stats = { ...this.stats, ...updates };

      return {
        data: this.stats,
        success: true,
        message: 'Statistics updated successfully'
      };
    } catch (error) {
      return {
        data: this.stats,
        success: false,
        error: 'Failed to update statistics'
      };
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
