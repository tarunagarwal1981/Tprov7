import { supabase } from '@/lib/supabase';
import { Package, PackageVariant, PackageFormData } from '@/lib/types';

export interface ActivityPackageData {
  // Basic package info
  title: string;
  description: string;
  place: string;
  durationHours?: number;
  durationDays?: number;
  
  // Activity-specific fields
  activityCategory?: string;
  availableDays?: string[];
  operationalHours?: any;
  meetingPoint?: string;
  emergencyContact?: any;
  transferOptions?: string[];
  maxCapacity?: number;
  languagesSupported?: string[];
  accessibilityInfo?: string[];
  ageRestrictionsDetailed?: any;
  importantInfo?: string;
  faq?: any[];
  
  // Variants
  variants?: PackageVariant[];
  
  // Pricing
  pricing?: Array<{
    adultPrice: number;
    childPrice: number;
    infantPrice?: number;
  }>;
}

export class ActivityPackageService {
  /**
   * Create a new activity package with all the enhanced fields
   */
  static async createActivityPackage(
    tourOperatorId: string,
    packageData: ActivityPackageData,
    imageFile?: File,
    status: 'DRAFT' | 'ACTIVE' = 'DRAFT'
  ): Promise<{ success: boolean; packageId?: string; error?: string }> {
    try {
      console.log('🚀 Creating activity package...', packageData);
      console.log('📸 Image file:', imageFile?.name);
      console.log('📊 Status:', status);

      // 1. Insert main package with activity-specific fields
      const packageInsert = {
        tour_operator_id: tourOperatorId,
        title: packageData.title,
        description: packageData.description,
        type: 'ACTIVITY',
        status: status,
        
        // Basic fields
        adult_price: packageData.pricing?.[0]?.adultPrice || 0,
        child_price: packageData.pricing?.[0]?.childPrice || 0,
        duration_days: packageData.durationDays || 1,
        duration_hours: packageData.durationHours || 0,
        
        // Activity-specific fields
        activity_category: packageData.activityCategory,
        available_days: packageData.availableDays,
        operational_hours: packageData.operationalHours,
        meeting_point: packageData.meetingPoint,
        emergency_contact: packageData.emergencyContact,
        transfer_options: packageData.transferOptions,
        max_capacity: packageData.maxCapacity,
        languages_supported: packageData.languagesSupported,
        accessibility_info: packageData.accessibilityInfo,
        age_restrictions: packageData.ageRestrictionsDetailed,
        important_info: packageData.importantInfo,
        faq: packageData.faq,
        
        // Legacy fields for compatibility
        destinations: packageData.place ? [packageData.place] : [],
        inclusions: [],
        exclusions: [],
        terms_and_conditions: [],
        cancellation_policy: {},
        images: [],
        group_size: { min: 1, max: packageData.maxCapacity || 20 },
        difficulty: 'EASY',
        tags: [],
        is_featured: false,
        rating: 0.0,
        review_count: 0
      };

      console.log('📦 Package insert data:', packageInsert);

      const { data: packageResult, error: packageError } = await supabase
        .from('packages')
        .insert(packageInsert)
        .select('id')
        .single();

      if (packageError) {
        console.error('❌ Package insert error:', packageError);
        return { success: false, error: packageError.message };
      }

      const packageId = packageResult.id;
      console.log('✅ Package created with ID:', packageId);

      // 2. Insert package variants if any
      if (packageData.variants && packageData.variants.length > 0) {
        console.log('📋 Creating package variants...');
        
        const variantsToInsert = packageData.variants.map((variant, index) => ({
          package_id: packageId,
          variant_name: variant.variantName,
          description: variant.description,
          inclusions: variant.inclusions,
          exclusions: variant.exclusions,
          price_adult: variant.priceAdult,
          price_child: variant.priceChild,
          price_infant: variant.priceInfant,
          min_guests: variant.minGuests,
          max_guests: variant.maxGuests,
          is_active: variant.isActive,
          order_index: index
        }));

        const { error: variantsError } = await supabase
          .from('package_variants')
          .insert(variantsToInsert);

        if (variantsError) {
          console.error('❌ Variants insert error:', variantsError);
          // Don't fail the whole operation, just log the error
          console.warn('⚠️ Package created but variants failed to save');
        } else {
          console.log('✅ Package variants created successfully');
        }
      }

      // Upload and save image if provided
      if (imageFile) {
        console.log('📸 Uploading activity package image...');
        const { ImageService } = await import('./imageService');
        const imageResult = await ImageService.uploadAndSavePackageImage(
          imageFile, 
          packageId, 
          true, // isPrimary
          0 // order
        );
        
        if (!imageResult.success) {
          console.warn('⚠️ Image upload failed, but package was created:', imageResult.error);
        } else {
          console.log('✅ Activity package image uploaded successfully:', imageResult.url);
        }
      }

      return { success: true, packageId };
    } catch (error) {
      console.error('❌ Activity package creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update an existing activity package
   */
  static async updateActivityPackage(
    packageId: string,
    packageData: Partial<ActivityPackageData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Updating activity package:', packageId, packageData);

      // Update main package
      const updateData: any = {};
      
      if (packageData.title) updateData.title = packageData.title;
      if (packageData.description) updateData.description = packageData.description;
      if (packageData.activityCategory) updateData.activity_category = packageData.activityCategory;
      if (packageData.availableDays) updateData.available_days = packageData.availableDays;
      if (packageData.operationalHours) updateData.operational_hours = packageData.operationalHours;
      if (packageData.meetingPoint) updateData.meeting_point = packageData.meetingPoint;
      if (packageData.emergencyContact) updateData.emergency_contact = packageData.emergencyContact;
      if (packageData.transferOptions) updateData.transfer_options = packageData.transferOptions;
      if (packageData.maxCapacity) updateData.max_capacity = packageData.maxCapacity;
      if (packageData.languagesSupported) updateData.languages_supported = packageData.languagesSupported;
      if (packageData.accessibilityInfo) updateData.accessibility_info = packageData.accessibilityInfo;
      if (packageData.ageRestrictionsDetailed) updateData.age_restrictions = packageData.ageRestrictionsDetailed;
      if (packageData.importantInfo) updateData.important_info = packageData.importantInfo;
      if (packageData.faq) updateData.faq = packageData.faq;
      if (packageData.durationHours) updateData.duration_hours = packageData.durationHours;
      if (packageData.durationDays) updateData.duration_days = packageData.durationDays;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('packages')
          .update(updateData)
          .eq('id', packageId);

        if (updateError) {
          console.error('❌ Package update error:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      // Update variants if provided
      if (packageData.variants) {
        // Delete existing variants
        await supabase
          .from('package_variants')
          .delete()
          .eq('package_id', packageId);

        // Insert new variants
        if (packageData.variants.length > 0) {
          const variantsToInsert = packageData.variants.map((variant, index) => ({
            package_id: packageId,
            variant_name: variant.variantName,
            description: variant.description,
            inclusions: variant.inclusions,
            exclusions: variant.exclusions,
            price_adult: variant.priceAdult,
            price_child: variant.priceChild,
            price_infant: variant.priceInfant,
            min_guests: variant.minGuests,
            max_guests: variant.maxGuests,
            is_active: variant.isActive,
            order_index: index
          }));

          const { error: variantsError } = await supabase
            .from('package_variants')
            .insert(variantsToInsert);

          if (variantsError) {
            console.error('❌ Variants update error:', variantsError);
            return { success: false, error: variantsError.message };
          }
        }
      }

      console.log('✅ Activity package updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Activity package update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get activity package with variants
   */
  static async getActivityPackage(packageId: string): Promise<{
    success: boolean;
    package?: Package & { variants?: PackageVariant[] };
    error?: string;
  }> {
    try {
      // Get main package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .eq('type', 'ACTIVITY')
        .single();

      if (packageError) {
        return { success: false, error: packageError.message };
      }

      // Get variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('package_variants')
        .select('*')
        .eq('package_id', packageId)
        .order('order_index');

      if (variantsError) {
        console.warn('⚠️ Could not fetch variants:', variantsError);
      }

      return {
        success: true,
        package: {
          ...packageData,
          variants: variantsData || []
        }
      };
    } catch (error) {
      console.error('❌ Get activity package error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Convert form data to activity package data
   */
  static convertFormDataToActivityPackage(formData: PackageFormData): ActivityPackageData {
    return {
      title: formData.title,
      description: formData.description,
      place: formData.place,
      durationHours: formData.durationHours,
      durationDays: formData.durationDays,
      
      // Activity-specific fields
      activityCategory: formData.activityCategory,
      availableDays: formData.availableDays,
      operationalHours: formData.operationalHours,
      meetingPoint: formData.meetingPoint,
      emergencyContact: formData.emergencyContact,
      transferOptions: formData.transferOptions,
      maxCapacity: formData.maxCapacity,
      languagesSupported: formData.languagesSupported,
      accessibilityInfo: formData.accessibilityInfo,
      ageRestrictionsDetailed: formData.ageRestrictionsDetailed,
      importantInfo: formData.importantInfo,
      faq: formData.faq,
      
      // Variants
      variants: formData.variants,
      
      // Pricing
      pricing: formData.pricing || [{
        adultPrice: formData.adultPrice || 0,
        childPrice: formData.childPrice || 0,
        infantPrice: formData.infantPrice || 0
      }]
    };
  }
}
