import { supabase } from '../supabase'
import { 
  DbUser, 
  DbUserUpdate,
  SupabaseResponse,
  SupabaseListResponse 
} from '../supabase-types'
import { User, UserRole } from '../types'

export class UserService {
  // Get current user
  static async getCurrentUser(): Promise<SupabaseResponse<DbUser>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching current user:', error)
      return { data: null, error }
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<SupabaseResponse<DbUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { data: null, error }
    }
  }

  // Update user profile
  static async updateUserProfile(id: string, updates: DbUserUpdate): Promise<SupabaseResponse<DbUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }
  }

  // Update user role (admin only)
  static async updateUserRole(id: string, role: UserRole): Promise<SupabaseResponse<DbUser>> {
    return this.updateUserProfile(id, { role })
  }

  // Get all users (admin only)
  static async getAllUsers(options: {
    role?: UserRole
    isActive?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<SupabaseListResponse<DbUser>> {
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      // Apply filters
      if (options.role) {
        query = query.eq('role', options.role)
      }
      
      if (options.isActive !== undefined) {
        query = query.eq('is_active', options.isActive)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      // Order by created_at desc
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error
      return { data, error: null, count }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { data: null, error, count: null }
    }
  }

  // Deactivate user
  static async deactivateUser(id: string): Promise<SupabaseResponse<DbUser>> {
    return this.updateUserProfile(id, { is_active: false })
  }

  // Activate user
  static async activateUser(id: string): Promise<SupabaseResponse<DbUser>> {
    return this.updateUserProfile(id, { is_active: true })
  }

  // Update last login
  static async updateLastLogin(id: string): Promise<SupabaseResponse<DbUser>> {
    return this.updateUserProfile(id, { last_login_at: new Date().toISOString() })
  }

  // Convert database user to app user format
  static convertToAppUser(dbUser: DbUser): User {
    // Handle profile conversion - ensure it has the expected structure
    let profile = dbUser.profile as any;
    
    // If profile doesn't have firstName/lastName, try to extract from name or create defaults
    if (!profile || typeof profile !== 'object') {
      profile = {};
    }
    
    // Extract firstName and lastName from name if not present in profile
    if (!profile.firstName || !profile.lastName) {
      const nameParts = dbUser.name.split(' ');
      profile.firstName = profile.firstName || nameParts[0] || 'User';
      profile.lastName = profile.lastName || nameParts.slice(1).join(' ') || '';
    }
    
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      profile: profile,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
      isActive: dbUser.is_active,
      lastLoginAt: dbUser.last_login_at ? new Date(dbUser.last_login_at) : undefined
    }
  }
}
