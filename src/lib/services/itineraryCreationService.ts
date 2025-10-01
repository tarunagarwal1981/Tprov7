import { supabase } from '@/lib/supabase';
import { 
  ItineraryCreationSession, 
  SelectedPackage, 
  DayAssignment, 
  PackageRecommendation,
  EnhancedPackage,
  ItineraryCreationFilters,
  ItineraryDayActivity
} from '@/lib/types/itinerary-creation';
import { Lead } from '@/lib/types/agent';

export class ItineraryCreationService {
  // Session Management
  async createSession(leadId: string, agentId: string): Promise<{ data: ItineraryCreationSession; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('itinerary_creation_sessions')
        .insert({
          lead_id: leadId,
          agent_id: agentId,
          status: 'PACKAGE_SELECTION',
          selected_packages: [],
          day_assignments: []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: {
          id: data.id,
          leadId: data.lead_id,
          agentId: data.agent_id,
          status: data.status,
          selectedPackages: data.selected_packages || [],
          dayAssignments: data.day_assignments || [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        },
        success: true
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        data: {} as ItineraryCreationSession,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      };
    }
  }

  async updateSession(sessionId: string, updates: Partial<ItineraryCreationSession>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.selectedPackages) updateData.selected_packages = updates.selectedPackages;
      if (updates.dayAssignments) updateData.day_assignments = updates.dayAssignments;

      const { error } = await supabase
        .from('itinerary_creation_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update session'
      };
    }
  }

  async getSession(sessionId: string): Promise<{ data: ItineraryCreationSession | null; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('itinerary_creation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      if (!data) {
        return { data: null, success: true };
      }

      return {
        data: {
          id: data.id,
          leadId: data.lead_id,
          agentId: data.agent_id,
          status: data.status,
          selectedPackages: data.selected_packages || [],
          dayAssignments: data.day_assignments || [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        },
        success: true
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session'
      };
    }
  }

  // Package Recommendations
  async generateRecommendations(leadId: string): Promise<{ data: PackageRecommendation[]; success: boolean; error?: string }> {
    try {
      // First, get the lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      // Get packages for the destination
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          tour_operators (
            id,
            company_name,
            rating
          )
        `)
        .eq('status', 'ACTIVE')
        .contains('destinations', [lead.destination]);

      if (packagesError) throw packagesError;

      // Generate recommendations based on lead preferences
      const recommendations: PackageRecommendation[] = packages.map(pkg => {
        let score = 0.5; // Base score
        let reasons: string[] = [];

        // Destination match
        if (pkg.destinations.includes(lead.destination)) {
          score += 0.2;
          reasons.push('Matches destination');
        }

        // Trip type match
        if (pkg.recommended_for_trip_types?.includes(lead.trip_type)) {
          score += 0.15;
          reasons.push(`Suitable for ${lead.trip_type.toLowerCase()} trips`);
        }

        // Budget consideration
        const packagePrice = pkg.pricing?.adult || 0;
        if (packagePrice <= lead.budget * 0.3) {
          score += 0.1;
          reasons.push('Within budget range');
        }

        // Rating consideration
        if (pkg.rating >= 4.0) {
          score += 0.1;
          reasons.push('Highly rated');
        }

        // Duration match
        if (pkg.duration?.days <= lead.duration) {
          score += 0.05;
          reasons.push('Fits trip duration');
        }

        return {
          id: `rec-${pkg.id}`,
          leadId,
          packageId: pkg.id,
          recommendationScore: Math.min(score, 1.0),
          reason: reasons.join(', '),
          createdAt: new Date()
        };
      });

      // Sort by score and take top 10
      const topRecommendations = recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 10);

      // Save recommendations to database
      const recommendationData = topRecommendations.map(rec => ({
        lead_id: rec.leadId,
        package_id: rec.packageId,
        recommendation_score: rec.recommendationScore,
        reason: rec.reason
      }));

      const { error: insertError } = await supabase
        .from('package_recommendations')
        .upsert(recommendationData, { onConflict: 'lead_id,package_id' });

      if (insertError) throw insertError;

      return {
        data: topRecommendations,
        success: true
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations'
      };
    }
  }

  async getRecommendations(leadId: string): Promise<{ data: PackageRecommendation[]; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('package_recommendations')
        .select('*')
        .eq('lead_id', leadId)
        .order('recommendation_score', { ascending: false });

      if (error) throw error;

      const recommendations: PackageRecommendation[] = data.map(rec => ({
        id: rec.id,
        leadId: rec.lead_id,
        packageId: rec.package_id,
        recommendationScore: rec.recommendation_score,
        reason: rec.reason,
        createdAt: new Date(rec.created_at)
      }));

      return {
        data: recommendations,
        success: true
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      };
    }
  }

  // Enhanced Package Search
  async searchPackages(filters: ItineraryCreationFilters, leadId?: string): Promise<{ data: EnhancedPackage[]; success: boolean; error?: string }> {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          tour_operators (
            id,
            company_name,
            rating
          )
        `)
        .eq('status', 'ACTIVE');

      // Apply filters
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.packageTypes.length > 0) {
        query = query.in('type', filters.packageTypes);
      }

      if (filters.destinations.length > 0) {
        query = query.overlaps('destinations', filters.destinations);
      }

      if (filters.rating > 0) {
        query = query.gte('rating', filters.rating);
      }

      // Apply sorting
      const sortColumn = filters.sortBy === 'relevance' ? 'rating' : filters.sortBy;
      query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Get recommendations if leadId is provided
      let recommendations: PackageRecommendation[] = [];
      if (leadId) {
        const recResponse = await this.getRecommendations(leadId);
        if (recResponse.success) {
          recommendations = recResponse.data;
        }
      }

      // Transform to EnhancedPackage format
      const enhancedPackages: EnhancedPackage[] = data.map(pkg => {
        const recommendation = recommendations.find(rec => rec.packageId === pkg.id);
        
        return {
          id: pkg.id,
          title: pkg.title,
          description: pkg.description,
          type: pkg.type,
          status: pkg.status,
          pricing: {
            adult: pkg.pricing?.adult || 0,
            child: pkg.pricing?.child || 0,
            currency: pkg.pricing?.currency || 'USD'
          },
          destinations: pkg.destinations || [],
          duration: {
            days: pkg.duration?.days || 1,
            hours: pkg.duration?.hours || 8
          },
          operatorName: pkg.tour_operators?.company_name || 'Unknown Operator',
          operatorId: pkg.tour_operator_id,
          rating: pkg.rating || 0,
          reviewCount: pkg.review_count || 0,
          images: pkg.images || [],
          inclusions: pkg.inclusions || [],
          exclusions: pkg.exclusions || [],
          tags: pkg.tags || [],
          difficulty: pkg.difficulty || 'EASY',
          groupSize: {
            min: pkg.group_size?.min || 1,
            max: pkg.group_size?.max || 10
          },
          recommendedForTripTypes: pkg.recommended_for_trip_types || [],
          averageBookingTime: pkg.average_booking_time || 0,
          seasonalAvailability: pkg.seasonal_availability || {},
          isRecommended: !!recommendation,
          recommendationScore: recommendation?.recommendationScore,
          recommendationReason: recommendation?.reason
        };
      });

      return {
        data: enhancedPackages,
        success: true
      };
    } catch (error) {
      console.error('Error searching packages:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search packages'
      };
    }
  }

  // Day Planning
  async saveDayActivities(dayId: string, activities: ItineraryDayActivity[]): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete existing activities for this day
      await supabase
        .from('itinerary_day_activities')
        .delete()
        .eq('itinerary_day_id', dayId);

      // Insert new activities
      const activityData = activities.map(activity => ({
        itinerary_day_id: dayId,
        package_id: activity.packageId,
        activity_name: activity.activityName,
        activity_type: activity.activityType,
        time_slot: activity.timeSlot,
        duration_hours: activity.durationHours,
        cost: activity.cost,
        location: activity.location,
        notes: activity.notes,
        order_index: activity.orderIndex
      }));

      const { error } = await supabase
        .from('itinerary_day_activities')
        .insert(activityData);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving day activities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save day activities'
      };
    }
  }

  async getDayActivities(dayId: string): Promise<{ data: ItineraryDayActivity[]; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('itinerary_day_activities')
        .select('*')
        .eq('itinerary_day_id', dayId)
        .order('order_index');

      if (error) throw error;

      const activities: ItineraryDayActivity[] = data.map(activity => ({
        id: activity.id,
        itineraryDayId: activity.itinerary_day_id,
        packageId: activity.package_id,
        activityName: activity.activity_name,
        activityType: activity.activity_type,
        timeSlot: activity.time_slot,
        durationHours: activity.duration_hours,
        cost: activity.cost,
        location: activity.location,
        notes: activity.notes,
        orderIndex: activity.order_index,
        createdAt: new Date(activity.created_at)
      }));

      return {
        data: activities,
        success: true
      };
    } catch (error) {
      console.error('Error getting day activities:', error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get day activities'
      };
    }
  }

  // Lead Data
  async getLeadData(leadId: string): Promise<{ data: Lead | null; success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      if (!data) {
        return { data: null, success: true };
      }

      const lead: Lead = {
        id: data.id,
        customerName: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        destination: data.destination,
        budget: data.budget,
        tripType: data.trip_type,
        travelers: data.travelers,
        duration: data.duration,
        preferredDates: {
          start: new Date(data.preferred_start_date),
          end: new Date(data.preferred_end_date)
        },
        preferences: data.preferences || [],
        status: data.status,
        source: data.source,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        agentId: data.agent_id,
        notes: data.notes,
        communicationLog: []
      };

      return {
        data: lead,
        success: true
      };
    } catch (error) {
      console.error('Error getting lead data:', error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lead data'
      };
    }
  }
}

export const itineraryCreationService = new ItineraryCreationService();
