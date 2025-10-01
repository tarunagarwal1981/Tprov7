import { supabase } from '@/lib/supabase';

export interface PackageAnalytics {
  id: string;
  package_id: string;
  total_views: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_ratings: number;
  last_viewed_at: string | null;
  last_booking_at: string | null;
  last_updated_at: string;
}

export interface PackageView {
  id: string;
  package_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  viewed_at: string;
  session_id: string | null;
  referrer: string | null;
  created_at: string;
}

export interface PackageBooking {
  id: string;
  package_id: string;
  customer_id: string | null;
  booking_reference: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  special_requests: string | null;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackageRating {
  id: string;
  package_id: string;
  customer_id: string | null;
  booking_id: string | null;
  rating: number;
  review_text: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class PackageAnalyticsService {
  /**
   * Track a package view
   */
  static async trackView(
    packageId: string,
    options: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      referrer?: string;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('track_package_view', {
        pkg_id: packageId,
        user_id_param: options.userId || null,
        ip_address_param: options.ipAddress || null,
        user_agent_param: options.userAgent || null,
        session_id_param: options.sessionId || null,
        referrer_param: options.referrer || null,
      });

      if (error) {
        console.error('Error tracking package view:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error tracking package view:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for a specific package
   */
  static async getPackageAnalytics(packageId: string): Promise<{
    success: boolean;
    data?: PackageAnalytics;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_analytics')
        .select('*')
        .eq('package_id', packageId)
        .single();

      if (error) {
        console.error('Error fetching package analytics:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching package analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for multiple packages
   */
  static async getMultiplePackageAnalytics(packageIds: string[]): Promise<{
    success: boolean;
    data?: PackageAnalytics[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_analytics')
        .select('*')
        .in('package_id', packageIds);

      if (error) {
        console.error('Error fetching multiple package analytics:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching multiple package analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent views for a package
   */
  static async getPackageViews(
    packageId: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data?: PackageView[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_views')
        .select('*')
        .eq('package_id', packageId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching package views:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching package views:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get bookings for a package
   */
  static async getPackageBookings(
    packageId: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data?: PackageBooking[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_bookings')
        .select('*')
        .eq('package_id', packageId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching package bookings:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching package bookings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get ratings for a package
   */
  static async getPackageRatings(
    packageId: string,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data?: PackageRating[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_ratings')
        .select('*')
        .eq('package_id', packageId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching package ratings:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching package ratings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update analytics for a package (manual refresh)
   */
  static async refreshPackageAnalytics(packageId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase.rpc('update_package_analytics', {
        pkg_id: packageId,
      });

      if (error) {
        console.error('Error refreshing package analytics:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error refreshing package analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics summary for all packages owned by current user
   */
  static async getUserPackageAnalytics(): Promise<{
    success: boolean;
    data?: {
      totalViews: number;
      totalBookings: number;
      totalRevenue: number;
      averageRating: number;
      totalPackages: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('package_analytics')
        .select(`
          total_views,
          total_bookings,
          total_revenue,
          average_rating,
          package_id
        `)
        .eq('package.package.tour_operator.user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error fetching user package analytics:', error);
        return { success: false, error: error.message };
      }

      const analytics = data || [];
      const summary = {
        totalViews: analytics.reduce((sum, a) => sum + a.total_views, 0),
        totalBookings: analytics.reduce((sum, a) => sum + a.total_bookings, 0),
        totalRevenue: analytics.reduce((sum, a) => sum + a.total_revenue, 0),
        averageRating: analytics.length > 0 
          ? analytics.reduce((sum, a) => sum + a.average_rating, 0) / analytics.length 
          : 0,
        totalPackages: analytics.length,
      };

      return { success: true, data: summary };
    } catch (error: any) {
      console.error('Error fetching user package analytics:', error);
      return { success: false, error: error.message };
    }
  }
}
