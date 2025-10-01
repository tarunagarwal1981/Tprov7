import { createClient } from '@supabase/supabase-js'

// Fallback values for development/build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmadgbdfpbnhacqjxwct.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWRnYmRmcGJuaGFjcWp4d2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTQ4NTksImV4cCI6MjA3MzM5MDg1OX0.Q2R5iftFJJIrNj8xBdL7r4IRW8GzghjsN1OMvb7mixE'

// Singleton class to ensure only one instance
class SupabaseClientSingleton {
  private static instance: any;
  private static isInitialized = false;

  static getInstance() {
    // Check if we're in browser environment and if client already exists globally
    if (typeof window !== 'undefined' && (window as any).__supabaseClient) {
      return (window as any).__supabaseClient;
    }

    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          flowType: 'pkce'
        }
      });

      // Store globally to prevent recreation
      if (typeof window !== 'undefined') {
        (window as any).__supabaseClient = SupabaseClientSingleton.instance;
        
        if (!SupabaseClientSingleton.isInitialized) {
          console.log('🔍 Supabase Environment Check:');
          console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
          console.log('Key:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');
          console.log('✅ Supabase client created successfully');
          SupabaseClientSingleton.isInitialized = true;
        }
      }
    }
    return SupabaseClientSingleton.instance;
  }
}

export const supabase = SupabaseClientSingleton.getInstance();
