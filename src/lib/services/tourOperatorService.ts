import { supabase } from '../supabase'
import { 
  DbTourOperator, 
  DbTourOperatorInsert,
  DbTourOperatorUpdate,
  SupabaseResponse,
  SupabaseListResponse 
} from '../supabase-types'
import { TourOperator } from '../types'

export class TourOperatorService {
  // Get tour operator by user ID
  static async getTourOperatorByUserId(userId: string): Promise<SupabaseResponse<DbTourOperator>> {
    try {
      const { data, error } = await supabase
        .from('tour_operators')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching tour operator by user ID:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching tour operator by user ID:', error)
      return { data: null, error }
    }
  }

  // Get tour operator by ID
  static async getTourOperatorById(id: string): Promise<SupabaseResponse<DbTourOperator>> {
    try {
      const { data, error } = await supabase
        .from('tour_operators')
        .select('*')
        .eq('id', id)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching tour operator by ID:', error)
        return { data: null, error }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching tour operator by ID:', error)
      return { data: null, error }
    }
  }

  // Create tour operator profile
  static async createTourOperator(tourOperatorData: DbTourOperatorInsert): Promise<SupabaseResponse<DbTourOperator>> {
    try {
      const { data, error } = await supabase
        .from('tour_operators')
        .insert(tourOperatorData)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating tour operator:', error)
      return { data: null, error }
    }
  }

  // Update tour operator profile
  static async updateTourOperator(id: string, updates: DbTourOperatorUpdate): Promise<SupabaseResponse<DbTourOperator>> {
    try {
      const { data, error } = await supabase
        .from('tour_operators')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating tour operator:', error)
      return { data: null, error }
    }
  }

  // Get all tour operators with pagination
  static async getTourOperators(options: {
    limit?: number
    offset?: number
    verified?: boolean
  } = {}): Promise<SupabaseListResponse<DbTourOperator>> {
    try {
      let query = supabase
        .from('tour_operators')
        .select('*')

      if (options.verified !== undefined) {
        query = query.eq('is_verified', options.verified)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { data: data || [], error: null, count }
    } catch (error) {
      console.error('Error fetching tour operators:', error)
      return { data: [], error, count: 0 }
    }
  }

  // Convert database tour operator to app tour operator
  static convertToAppTourOperator(dbTourOperator: DbTourOperator): TourOperator {
    return {
      id: dbTourOperator.id,
      userId: dbTourOperator.user_id,
      companyName: dbTourOperator.company_name,
      companyDetails: dbTourOperator.company_details as any,
      commissionRates: dbTourOperator.commission_rates as any,
      licenses: dbTourOperator.licenses as any,
      certifications: dbTourOperator.certifications as any,
      isVerified: dbTourOperator.is_verified,
      rating: dbTourOperator.rating,
      reviewCount: dbTourOperator.review_count,
      createdAt: new Date(dbTourOperator.created_at),
      updatedAt: new Date(dbTourOperator.updated_at)
    }
  }

  // Convert app tour operator to database tour operator
  static convertToDbTourOperator(appTourOperator: Partial<TourOperator>): DbTourOperatorInsert {
    return {
      user_id: appTourOperator.userId!,
      company_name: appTourOperator.companyName!,
      company_details: appTourOperator.companyDetails as any,
      commission_rates: appTourOperator.commissionRates as any,
      licenses: appTourOperator.licenses as any,
      certifications: appTourOperator.certifications as any,
      is_verified: appTourOperator.isVerified || false,
      rating: appTourOperator.rating || 0,
      review_count: appTourOperator.reviewCount || 0
    }
  }

  // Ensure tour operator profile exists for user
  static async ensureTourOperatorProfile(userId: string, companyName: string = 'My Company'): Promise<SupabaseResponse<DbTourOperator>> {
    try {
      // First check if tour operator profile exists
      const existingProfile = await this.getTourOperatorByUserId(userId)
      
      if (existingProfile.data) {
        return existingProfile
      }

      console.log('🔧 Creating tour operator profile for user:', userId)

      // Create tour operator profile if it doesn't exist
      const newProfile = await this.createTourOperator({
        user_id: userId,
        company_name: companyName,
        company_details: {
          legalName: companyName,
          registrationNumber: `REG-${userId.substring(0, 8)}`,
          taxId: `TAX-${userId.substring(0, 8)}`,
          website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+1-555-0123',
          address: {
            street: '123 Travel Street',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            postalCode: '94102'
          }
        },
        commission_rates: {
          standard: 15.0,
          premium: 20.0,
          luxury: 25.0
        },
        licenses: [],
        certifications: [],
        is_verified: false,
        rating: 0,
        review_count: 0
      })

      if (newProfile.error) {
        console.error('Error creating tour operator profile:', newProfile.error)
        return newProfile
      }

      console.log('✅ Tour operator profile created successfully:', newProfile.data)
      return newProfile
    } catch (error) {
      console.error('Error ensuring tour operator profile:', error)
      return { data: null, error }
    }
  }
}

// Export singleton instance
export const tourOperatorService = new TourOperatorService()
