import { supabase } from '../supabase'
import { 
  DbPackage, 
  DbPackageInsert, 
  DbPackageUpdate, 
  PackageWithDetails,
  SupabaseResponse,
  SupabaseListResponse 
} from '../supabase-types'
import { Package, PackageStatus, PackageType, VehicleConfig, PickupPoint, AdditionalService } from '../types'

// Service response interfaces to match existing code
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PackageFilters {
  type?: PackageType;
  status?: PackageStatus;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  destination?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface PackageSearchParams {
  query?: string;
  filters?: PackageFilters;
  sortBy?: 'title' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class PackageService {
  // Create a new package
  async createPackage(packageData: DbPackageInsert): Promise<ServiceResponse<DbPackage>> {
    try {
      console.log('📦 PackageService: Creating package with data:', {
        title: packageData.title,
        type: packageData.type,
        status: packageData.status,
        tourOperatorId: packageData.tour_operator_id,
      });
      
      const { data, error } = await PackageService.createPackageStatic(packageData);
      
      if (error) {
        console.error('❌ PackageService: Error creating package:', error);
        return { data: null as any, success: false, error: error.message || 'Failed to create package' };
      }
      
      console.log('✅ PackageService: Package created successfully:', data?.id);
      return { data: data!, success: true, message: 'Package created successfully' };
    } catch (error) {
      console.error('❌ PackageService: Exception creating package:', error);
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create package' 
      };
    }
  }

  // Get packages with filtering and pagination (compatible with existing interface)
  async getPackages(params: PackageSearchParams = {}): Promise<ServiceResponse<PaginatedResponse<Package>>> {
    try {
      // Get current user's tour operator ID if available
      const { data: { user } } = await supabase.auth.getUser();
      let tourOperatorId = null;
      
      if (user) {
        const { data: tourOperator } = await supabase
          .from('tour_operators')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        tourOperatorId = tourOperator?.id;
      }

      const { data, error, count } = await PackageService.getPackages({
        status: params.filters?.status, // Don't default to ACTIVE - show all packages including drafts
        type: params.filters?.type,
        featured: params.filters?.isFeatured,
        search: params.query,
        tourOperatorId: tourOperatorId, // Pass the tour operator ID
        destinations: params.filters?.destination ? [params.filters.destination] : undefined,
        tags: params.filters?.tags,
        minPrice: params.filters?.minPrice,
        maxPrice: params.filters?.maxPrice,
        limit: params.limit || 12,
        offset: ((params.page || 1) - 1) * (params.limit || 12)
      });

      if (error) {
        return { 
          data: null as any, 
          success: false, 
          error: error.message || 'Failed to fetch packages' 
        };
      }

      // Convert to app packages
      const packages = data?.map(pkg => PackageService.convertToAppPackage(pkg)) || [];
      
      const totalPages = count ? Math.ceil(count / (params.limit || 12)) : 0;
      const currentPage = params.page || 1;

      return {
        data: {
          data: packages,
          page: currentPage,
          limit: params.limit || 12,
          total: count || 0,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        },
        success: true
      };
    } catch (error) {
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch packages' 
      };
    }
  }

  // Get package by ID
  async getPackageById(id: string): Promise<ServiceResponse<PackageWithDetails>> {
    try {
      const { data, error } = await PackageService.getPackageById(id);
      
      if (error) {
        return { data: null as any, success: false, error: error.message || 'Failed to fetch package' };
      }
      
      if (!data) {
        return { data: null as any, success: false, error: 'Package not found' };
      }

      return { data, success: true };
    } catch (error) {
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch package' 
      };
    }
  }

  // Update package
  async updatePackage(id: string, updates: DbPackageUpdate): Promise<ServiceResponse<Package>> {
    try {
      const { data, error } = await PackageService.updatePackage(id, updates);
      
      if (error) {
        return { data: null as any, success: false, error: error.message || 'Failed to update package' };
      }
      
      if (!data) {
        return { data: null as any, success: false, error: 'Package not found' };
      }

      const packageData = PackageService.convertToAppPackage(data as any);
      return { data: packageData, success: true, message: 'Package updated successfully' };
    } catch (error) {
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update package' 
      };
    }
  }

  // Delete package
  async deletePackage(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await PackageService.deletePackage(id);
      
      if (error) {
        return { data: false, success: false, error: error.message || 'Failed to delete package' };
      }
      
      return { data: true, success: true, message: 'Package deleted successfully' };
    } catch (error) {
      return { 
        data: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete package' 
      };
    }
  }

  // Get package statistics - simplified version
  async getPackageStats(): Promise<ServiceResponse<{
    totalPackages: number;
    activePackages: number;
    totalRevenue: number;
    averageRating: number;
  }>> {
    try {
      console.log('🔄 PackageService: Getting package statistics...');
      
      // Get current user's tour operator ID if available
      const { data: { user } } = await supabase.auth.getUser();
      let tourOperatorId = null;
      
      if (user) {
        const { data: tourOperator } = await supabase
          .from('tour_operators')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        tourOperatorId = tourOperator?.id;
        console.log('🏢 PackageService: Current tour operator ID:', tourOperatorId);
      }
      
      // Direct query to packages table
      let packagesQuery = supabase
        .from('packages')
        .select('id, title, status, pricing, rating');
      
      if (tourOperatorId) {
        packagesQuery = packagesQuery.eq('tour_operator_id', tourOperatorId);
      }
      
      const { data: packages, error } = await packagesQuery;
      
      console.log('📦 PackageService: Direct packages query result:', { 
        count: packages?.length, 
        error,
        sample: packages?.[0] 
      });
      
      if (error) {
        console.error('❌ PackageService: Error fetching packages:', error);
        return { 
          data: { totalPackages: 0, activePackages: 0, totalRevenue: 0, averageRating: 0 }, 
          success: false, 
          error: error.message || 'Failed to fetch package statistics' 
        };
      }

      const totalPackages = packages?.length || 0;
      const activePackages = packages?.filter((pkg: any) => pkg.status === 'ACTIVE').length || 0;
      
      console.log('📊 PackageService: Basic stats calculated:', { totalPackages, activePackages });
      
      // Calculate total revenue from package pricing
      let totalRevenue = 0;
      if (packages && packages.length > 0) {
        totalRevenue = packages.reduce((sum: number, pkg: any) => {
          const pricing = pkg.pricing as any;
          // Try different pricing field names
          const basePrice = pricing?.basePrice || pricing?.price || pricing?.adultPrice || pricing?.totalPrice || 0;
          return sum + (Number(basePrice) || 0);
        }, 0);
        console.log('💰 PackageService: Revenue calculated from packages:', totalRevenue);
      }
      
      // Calculate average rating
      const averageRating = packages && packages.length > 0 
        ? packages.reduce((sum: number, pkg: any) => sum + (Number(pkg.rating) || 0), 0) / packages.length 
        : 0;

      const finalStats = {
        totalPackages,
        activePackages,
        totalRevenue,
        averageRating
      };

      console.log('✅ PackageService: Final stats calculated:', finalStats);

      return {
        data: finalStats,
        success: true
      };
    } catch (error) {
      console.error('❌ PackageService: Error in getPackageStats:', error);
      return { 
        data: { totalPackages: 0, activePackages: 0, totalRevenue: 0, averageRating: 0 }, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch package statistics' 
      };
    }
  }

  // Get featured packages
  async getFeaturedPackages(limit: number = 10): Promise<ServiceResponse<Package[]>> {
    try {
      const { data, error } = await PackageService.getFeaturedPackages(limit);
      
      if (error) {
        return { data: [], success: false, error: error.message || 'Failed to fetch featured packages' };
      }
      
      const packages = data?.map(pkg => PackageService.convertToAppPackage(pkg)) || [];
      return { data: packages, success: true };
    } catch (error) {
      return { 
        data: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch featured packages' 
      };
    }
  }

  // Search packages
  async searchPackages(query: string, limit: number = 20): Promise<ServiceResponse<Package[]>> {
    try {
      const { data, error } = await PackageService.searchPackages(query, limit);
      
      if (error) {
        return { data: [], success: false, error: error.message || 'Failed to search packages' };
      }
      
      const packages = data?.map(pkg => PackageService.convertToAppPackage(pkg)) || [];
      return { data: packages, success: true };
    } catch (error) {
      return { 
        data: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search packages' 
      };
    }
  }

  // Static methods from the original PackageService (for backward compatibility)
  static async createPackageStatic(packageData: DbPackageInsert): Promise<SupabaseResponse<DbPackage>> {
    try {
      console.log('🔧 PackageService: Static createPackage called with:', {
        title: packageData.title,
        type: packageData.type,
        status: packageData.status,
        hasTransferServices: !!packageData.transfer_services,
        hasActivities: !!packageData.activities,
      });
      
      const { data, error } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single()

      if (error) {
        console.error('❌ PackageService: Supabase error creating package:', error);
        throw error;
      }
      
      console.log('✅ PackageService: Static createPackage successful:', data?.id);
      return { data, error: null }
    } catch (error) {
      console.error('❌ PackageService: Exception in static createPackage:', error)
      return { data: null, error }
    }
  }

  static async getPackageById(id: string): Promise<SupabaseResponse<PackageWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          tour_operator:tour_operators(
            *,
            user:users(*)
          ),
          images:package_images(*),
          reviews:reviews(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching package:', error)
      return { data: null, error }
    }
  }

  static async getPackages(options: {
    status?: PackageStatus
    type?: PackageType
    tourOperatorId?: string
    featured?: boolean
    limit?: number
    offset?: number
    search?: string
    destinations?: string[]
    tags?: string[]
    minPrice?: number
    maxPrice?: number
  } = {}): Promise<SupabaseListResponse<PackageWithDetails>> {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          tour_operator:tour_operators(
            *,
            user:users(*)
          ),
          images:package_images(*),
          reviews:reviews(*)
        `, { count: 'exact' })

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status)
      }
      
      if (options.type) {
        query = query.eq('type', options.type)
      }
      
      if (options.tourOperatorId) {
        query = query.eq('tour_operator_id', options.tourOperatorId)
      }
      
      if (options.featured !== undefined) {
        query = query.eq('is_featured', options.featured)
      }
      
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }
      
      if (options.destinations && options.destinations.length > 0) {
        query = query.overlaps('destinations', options.destinations)
      }
      
      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags)
      }

      // Apply price filtering
      if (options.minPrice !== undefined) {
        query = query.gte('adult_price', options.minPrice)
      }
      
      if (options.maxPrice !== undefined) {
        query = query.lte('adult_price', options.maxPrice)
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
      console.error('Error fetching packages:', error)
      return { data: null, error, count: null }
    }
  }

  static async updatePackage(id: string, updates: DbPackageUpdate): Promise<SupabaseResponse<DbPackage>> {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating package:', error)
      return { data: null, error }
    }
  }

  static async deletePackage(id: string): Promise<SupabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { data: null, error: null }
    } catch (error) {
      console.error('Error deleting package:', error)
      return { data: null, error }
    }
  }

  static async getFeaturedPackages(limit: number = 10): Promise<SupabaseListResponse<PackageWithDetails>> {
    return this.getPackages({ featured: true, status: PackageStatus.ACTIVE, limit })
  }

  static async searchPackages(searchTerm: string, limit: number = 20): Promise<SupabaseListResponse<PackageWithDetails>> {
    return this.getPackages({ search: searchTerm, status: PackageStatus.ACTIVE, limit })
  }

  static convertToAppPackage(dbPackage: PackageWithDetails): Package {
    // Map optimized schema fields to app model with safe fallbacks
    const basePrice = (dbPackage as any).adult_price ?? 0
    const currency = (dbPackage as any).currency ?? 'USD'
    const durationDays = (dbPackage as any).duration_days ?? 1
    const durationHours = (dbPackage as any).duration_hours ?? 0
    const minGroup = (dbPackage as any).min_group_size ?? 1
    const maxGroup = (dbPackage as any).max_group_size ?? 10

    // Images relation comes as array of objects; map to URL strings
    const imageRows: any[] = (dbPackage as any).images || []
    const imageUrls: string[] = Array.isArray(imageRows)
      ? imageRows.map((img: any) => img?.url).filter(Boolean)
      : []

    return {
      id: dbPackage.id,
      tourOperatorId: (dbPackage as any).tour_operator_id,
      title: dbPackage.title,
      description: dbPackage.description,
      type: dbPackage.type as PackageType,
      status: dbPackage.status as PackageStatus,
      pricing: {
        basePrice: Number(basePrice) || 0,
        currency: String(currency || 'USD'),
        pricePerPerson: true,
        groupDiscounts: [],
        seasonalPricing: [],
        inclusions: [],
        taxes: { gst: 0, serviceTax: 0, tourismTax: 0, other: [] },
        fees: { bookingFee: 0, processingFee: 0, cancellationFee: 0, other: [] },
      },
      itinerary: [],
      inclusions: [],
      exclusions: [],
      termsAndConditions: [],
      cancellationPolicy: { 
        freeCancellationDays: 0, 
        cancellationFees: [], 
        refundPolicy: { refundable: true, refundPercentage: 0, processingDays: 0, conditions: [] }, 
        forceMajeurePolicy: '' 
      },
      images: imageUrls,
      destinations: [],
      duration: { days: Number(durationDays) || 1, nights: Math.max((Number(durationDays) || 1) - 1, 0), totalHours: Number(durationHours) || 0 },
      groupSize: { min: Number(minGroup) || 1, max: Number(maxGroup) || 10, ideal: Math.max(Math.min(Number(maxGroup) || 10, 6), Number(minGroup) || 1) },
      difficulty: (dbPackage as any).difficulty as any,
      tags: (dbPackage as any).tags || [],
      isFeatured: (dbPackage as any).is_featured || false,
      rating: (dbPackage as any).rating || 0,
      reviewCount: (dbPackage as any).review_count || 0,
      createdAt: new Date((dbPackage as any).created_at),
      updatedAt: new Date((dbPackage as any).updated_at)
    }
  }

  static convertToDbPackage(appPackage: Partial<Package>): DbPackageInsert {
    return {
      tour_operator_id: appPackage.tourOperatorId!,
      title: appPackage.title!,
      description: appPackage.description!,
      type: appPackage.type! as any,
      status: appPackage.status || 'DRAFT',
      pricing: appPackage.pricing as any,
      itinerary: appPackage.itinerary as any,
      inclusions: appPackage.inclusions || [],
      exclusions: appPackage.exclusions || [],
      terms_and_conditions: appPackage.termsAndConditions || [],
      cancellation_policy: appPackage.cancellationPolicy as any,
      images: appPackage.images || [],
      destinations: appPackage.destinations || [],
      duration: appPackage.duration as any,
      group_size: appPackage.groupSize as any,
      difficulty: appPackage.difficulty || 'EASY',
      tags: appPackage.tags || [],
      is_featured: appPackage.isFeatured || false,
      rating: appPackage.rating || 0,
      review_count: appPackage.reviewCount || 0
    }
  }

  // Enhanced transfer package methods
  async createTransferPackageWithVehicles(packageData: DbPackageInsert, vehicleConfigs: VehicleConfig[], imageFile?: File): Promise<ServiceResponse<DbPackage>> {
    try {
      console.log('🚗 PackageService: createTransferPackageWithVehicles called');
      console.log('📦 Package data:', packageData);
      console.log('🚗 Vehicle configs:', vehicleConfigs);
      console.log('📸 Image file:', imageFile?.name);
      
      // Start a transaction
      console.log('🔄 Starting package creation...');
      const { data: packageResult, error: packageError } = await supabase
        .from('packages')
        .insert(packageData)
        .select()
        .single();

      if (packageError) {
        console.error('❌ PackageService: Package creation failed:', packageError);
        return { 
          data: null as any, 
          success: false, 
          error: packageError.message 
        };
      }

      console.log('✅ PackageService: Package created successfully:', packageResult.id);

      // Insert vehicle configurations
      if (vehicleConfigs.length > 0) {
        console.log('🚗 Inserting vehicle configurations...');
        const vehicleConfigsData = vehicleConfigs.map((config, index) => ({
          transfer_package_id: packageResult.id,
          vehicle_type: config.vehicleType,
          name: config.name,
          min_passengers: config.minPassengers,
          max_passengers: config.maxPassengers,
          base_price: config.basePrice,
          per_km_rate: config.perKmRate,
          per_hour_rate: config.perHourRate,
          features: config.features,
          description: config.description,
          images: config.images || [],
          is_active: config.isActive,
          order_index: index
        }));

        console.log('🚗 Vehicle configs data to insert:', vehicleConfigsData);

        const { error: vehicleError } = await supabase
          .from('transfer_vehicle_configs')
          .insert(vehicleConfigsData);

        if (vehicleError) {
          console.error('❌ PackageService: Vehicle configs insertion failed:', vehicleError);
          // Rollback package creation
          console.log('🔄 Rolling back package creation...');
          await supabase.from('packages').delete().eq('id', packageResult.id);
          return { 
            data: null as any, 
            success: false, 
            error: vehicleError.message 
          };
        }
        
        console.log('✅ PackageService: Vehicle configs inserted successfully');
      }

      // Upload and save image if provided
      if (imageFile) {
        console.log('📸 Uploading package image...');
        const { ImageService } = await import('./imageService');
        const imageResult = await ImageService.uploadAndSavePackageImage(
          imageFile, 
          packageResult.id, 
          true, // isPrimary
          0 // order
        );
        
        if (!imageResult.success) {
          console.warn('⚠️ Image upload failed, but package was created:', imageResult.error);
        } else {
          console.log('✅ Package image uploaded successfully:', imageResult.url);
        }
      }

      console.log('🎉 PackageService: Transfer package with vehicles created successfully');
      return { 
        data: packageResult, 
        success: true, 
        message: 'Transfer package created successfully' 
      };
    } catch (error) {
      console.error('💥 PackageService: Exception in createTransferPackageWithVehicles:', error);
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create transfer package' 
      };
    }
  }

  async getTransferPackageWithVehicles(packageId: string): Promise<ServiceResponse<Package & { vehicleConfigs: VehicleConfig[] }>> {
    try {
      // Get package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        return { 
          data: null as any, 
          success: false, 
          error: packageError.message 
        };
      }

      // Get vehicle configurations
      const { data: vehicleConfigs, error: vehicleError } = await supabase
        .from('transfer_vehicle_configs')
        .select('*')
        .eq('transfer_package_id', packageId)
        .eq('is_active', true)
        .order('order_index');

      if (vehicleError) {
        return { 
          data: null as any, 
          success: false, 
          error: vehicleError.message 
        };
      }

      // Convert to app format
      const appPackage = PackageService.convertToAppPackage(packageData);
      const appVehicleConfigs: VehicleConfig[] = vehicleConfigs.map(config => ({
        id: config.id,
        vehicleType: config.vehicle_type,
        name: config.name,
        minPassengers: config.min_passengers,
        maxPassengers: config.max_passengers,
        basePrice: config.base_price,
        perKmRate: config.per_km_rate,
        perHourRate: config.per_hour_rate,
        features: config.features || [],
        description: config.description,
        images: config.images || [],
        isActive: config.is_active,
        orderIndex: config.order_index
      }));

      return { 
        data: { ...appPackage, vehicleConfigs: appVehicleConfigs }, 
        success: true 
      };
    } catch (error) {
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transfer package' 
      };
    }
  }

  async updateTransferPackageVehicles(packageId: string, vehicleConfigs: VehicleConfig[]): Promise<ServiceResponse<boolean>> {
    try {
      // Delete existing vehicle configurations
      const { error: deleteError } = await supabase
        .from('transfer_vehicle_configs')
        .delete()
        .eq('transfer_package_id', packageId);

      if (deleteError) {
        return { 
          data: false, 
          success: false, 
          error: deleteError.message 
        };
      }

      // Insert new vehicle configurations
      if (vehicleConfigs.length > 0) {
        const vehicleConfigsData = vehicleConfigs.map((config, index) => ({
          transfer_package_id: packageId,
          vehicle_type: config.vehicleType,
          name: config.name,
          min_passengers: config.minPassengers,
          max_passengers: config.maxPassengers,
          base_price: config.basePrice,
          per_km_rate: config.perKmRate,
          per_hour_rate: config.perHourRate,
          features: config.features,
          description: config.description,
          images: config.images || [],
          is_active: config.isActive,
          order_index: index
        }));

        const { error: insertError } = await supabase
          .from('transfer_vehicle_configs')
          .insert(vehicleConfigsData);

        if (insertError) {
          return { 
            data: false, 
            success: false, 
            error: insertError.message 
          };
        }
      }

      return { 
        data: true, 
        success: true, 
        message: 'Vehicle configurations updated successfully' 
      };
    } catch (error) {
      return { 
        data: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update vehicle configurations' 
      };
    }
  }

  async searchTransferPackages(params: {
    from?: string;
    to?: string;
    passengers?: number;
    date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResponse<Array<Package & { vehicleConfigs: VehicleConfig[] }>>> {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          transfer_vehicle_configs (*)
        `)
        .eq('type', 'TRANSFERS')
        .eq('status', 'ACTIVE');

      // Apply filters
      if (params.from) {
        query = query.ilike('title', `%${params.from}%`);
      }
      if (params.to) {
        query = query.ilike('description', `%${params.to}%`);
      }

      const { data, error } = await query
        .limit(params.limit || 20)
        .offset(params.offset || 0);

      if (error) {
        return { 
          data: [], 
          success: false, 
          error: error.message 
        };
      }

      // Convert to app format
      const packages = data?.map(pkg => {
        const appPackage = PackageService.convertToAppPackage(pkg);
        const vehicleConfigs: VehicleConfig[] = pkg.transfer_vehicle_configs?.map((config: any) => ({
          id: config.id,
          vehicleType: config.vehicle_type,
          name: config.name,
          minPassengers: config.min_passengers,
          maxPassengers: config.max_passengers,
          basePrice: config.base_price,
          perKmRate: config.per_km_rate,
          perHourRate: config.per_hour_rate,
          features: config.features || [],
          description: config.description,
          images: config.images || [],
          isActive: config.is_active,
          orderIndex: config.order_index
        })) || [];

        return { ...appPackage, vehicleConfigs };
      }) || [];

      return { 
        data: packages, 
        success: true 
      };
    } catch (error) {
      return { 
        data: [], 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search transfer packages' 
      };
    }
  }
}

// Export singleton instance
export const packageService = new PackageService();