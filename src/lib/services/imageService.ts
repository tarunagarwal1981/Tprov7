import { supabase } from '@/lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ImageService {
  /**
   * Upload an image file to Supabase Storage
   */
  static async uploadImage(
    file: File, 
    bucket: string = 'package-images',
    folder: string = 'packages'
  ): Promise<ImageUploadResult> {
    try {
      console.log('📸 Uploading image:', file.name);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('📸 File path:', filePath);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('❌ Image upload error:', error);
        return { success: false, error: error.message };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      console.log('✅ Image uploaded successfully:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
      
    } catch (error) {
      console.error('💥 Image upload exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      };
    }
  }
  
  /**
   * Save image metadata to package_images table
   */
  static async savePackageImage(
    packageId: string,
    imageUrl: string,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Saving package image metadata:', { packageId, imageUrl, isPrimary, order });
      
      const { error } = await supabase
        .from('package_images')
        .insert({
          package_id: packageId,
          url: imageUrl,
          alt: `Package image ${order + 1}`,
          is_primary: isPrimary,
          order_index: order
        });
      
      if (error) {
        console.error('❌ Package image metadata save error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Package image metadata saved successfully');
      return { success: true };
      
    } catch (error) {
      console.error('💥 Package image metadata save exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save image metadata' 
      };
    }
  }
  
  /**
   * Upload image and save metadata in one operation
   */
  static async uploadAndSavePackageImage(
    file: File,
    packageId: string,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Upload image
      const uploadResult = await this.uploadImage(file);
      if (!uploadResult.success || !uploadResult.url) {
        return uploadResult;
      }
      
      // Save metadata
      const saveResult = await this.savePackageImage(packageId, uploadResult.url, isPrimary, order);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }
      
      return { success: true, url: uploadResult.url };
      
    } catch (error) {
      console.error('💥 Upload and save exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload and save image' 
      };
    }
  }
}
