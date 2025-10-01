import { supabase } from '../supabase'
import { 
  DbBooking, 
  DbBookingInsert, 
  DbBookingUpdate, 
  BookingWithDetails,
  SupabaseResponse,
  SupabaseListResponse 
} from '../supabase-types'
import { Booking, BookingStatus } from '../types'

export class BookingService {
  // Create a new booking
  static async createBooking(bookingData: DbBookingInsert): Promise<SupabaseResponse<DbBooking>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating booking:', error)
      return { data: null, error }
    }
  }

  // Get booking by ID with full details
  static async getBookingById(id: string): Promise<SupabaseResponse<BookingWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(
            *,
            tour_operator:tour_operators(
              *,
              user:users(*)
            ),
            images:package_images(*)
          ),
          user:users(*),
          travel_agent:users(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching booking:', error)
      return { data: null, error }
    }
  }

  // Get bookings with filtering and pagination
  static async getBookings(options: {
    userId?: string
    travelAgentId?: string
    packageId?: string
    status?: BookingStatus
    limit?: number
    offset?: number
  } = {}): Promise<SupabaseListResponse<BookingWithDetails>> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          package:packages(
            *,
            tour_operator:tour_operators(
              *,
              user:users(*)
            ),
            images:package_images(*)
          ),
          user:users(*),
          travel_agent:users(*)
        `, { count: 'exact' })

      // Apply filters
      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }
      
      if (options.travelAgentId) {
        query = query.eq('travel_agent_id', options.travelAgentId)
      }
      
      if (options.packageId) {
        query = query.eq('package_id', options.packageId)
      }
      
      if (options.status) {
        query = query.eq('status', options.status)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      // Order by created_at desc by default
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error
      return { data, error: null, count }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return { data: null, error, count: null }
    }
  }

  // Update booking
  static async updateBooking(id: string, updates: DbBookingUpdate): Promise<SupabaseResponse<DbBooking>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating booking:', error)
      return { data: null, error }
    }
  }

  // Cancel booking
  static async cancelBooking(id: string, reason?: string): Promise<SupabaseResponse<DbBooking>> {
    return this.updateBooking(id, { 
      status: 'CANCELLED',
      notes: reason ? `Cancelled: ${reason}` : 'Booking cancelled'
    })
  }

  // Confirm booking
  static async confirmBooking(id: string): Promise<SupabaseResponse<DbBooking>> {
    return this.updateBooking(id, { status: 'CONFIRMED' })
  }

  // Complete booking
  static async completeBooking(id: string): Promise<SupabaseResponse<DbBooking>> {
    return this.updateBooking(id, { status: 'COMPLETED' })
  }

  // Get bookings by user
  static async getBookingsByUser(userId: string): Promise<SupabaseListResponse<BookingWithDetails>> {
    return this.getBookings({ userId })
  }

  // Get bookings by travel agent
  static async getBookingsByTravelAgent(travelAgentId: string): Promise<SupabaseListResponse<BookingWithDetails>> {
    return this.getBookings({ travelAgentId })
  }

  // Get bookings by package
  static async getBookingsByPackage(packageId: string): Promise<SupabaseListResponse<BookingWithDetails>> {
    return this.getBookings({ packageId })
  }

  // Get pending bookings
  static async getPendingBookings(): Promise<SupabaseListResponse<BookingWithDetails>> {
    return this.getBookings({ status: 'PENDING' })
  }

  // Convert database booking to app booking format
  static convertToAppBooking(dbBooking: BookingWithDetails): Booking {
    return {
      id: dbBooking.id,
      packageId: dbBooking.package_id,
      userId: dbBooking.user_id,
      travelAgentId: dbBooking.travel_agent_id || undefined,
      status: dbBooking.status as BookingStatus,
      travelers: dbBooking.travelers as any,
      pricing: dbBooking.pricing as any,
      dates: dbBooking.dates as any,
      specialRequests: dbBooking.special_requests,
      notes: dbBooking.notes,
      createdAt: new Date(dbBooking.created_at),
      updatedAt: new Date(dbBooking.updated_at)
    }
  }

  // Convert app booking to database format
  static convertToDbBooking(appBooking: Partial<Booking>): DbBookingInsert {
    return {
      package_id: appBooking.packageId!,
      user_id: appBooking.userId!,
      travel_agent_id: appBooking.travelAgentId || null,
      status: appBooking.status || 'PENDING',
      travelers: appBooking.travelers as any,
      pricing: appBooking.pricing as any,
      dates: appBooking.dates as any,
      special_requests: appBooking.specialRequests || [],
      notes: appBooking.notes || ''
    }
  }
}
