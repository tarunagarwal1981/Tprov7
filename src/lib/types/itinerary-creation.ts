// Enhanced itinerary creation types and interfaces

export type ItineraryCreationStep = 'PACKAGE_SELECTION' | 'DAY_PLANNING' | 'DETAILS' | 'REVIEW';

export type ActivityType = 'PACKAGE' | 'CUSTOM' | 'TRANSFER' | 'MEAL' | 'ACCOMMODATION';

export interface ItineraryCreationSession {
  id: string;
  leadId: string;
  agentId: string;
  status: ItineraryCreationStep;
  selectedPackages: SelectedPackage[];
  dayAssignments: DayAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectedPackage {
  id: string;
  packageId: string;
  packageName: string;
  operatorId: string;
  operatorName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  duration: {
    days: number;
    hours: number;
  };
  type: string;
  destinations: string[];
  addedAt: Date;
  assignedToDays?: string[]; // Array of day IDs
}

export interface DayAssignment {
  dayId: string;
  dayNumber: number;
  date: Date;
  location: string;
  packageIds: string[];
  activities: ItineraryDayActivity[];
  totalCost: number;
  estimatedDuration: number; // in hours
}

export interface ItineraryDayActivity {
  id: string;
  itineraryDayId: string;
  packageId?: string;
  activityName: string;
  activityType: ActivityType;
  timeSlot: string;
  durationHours: number;
  cost: number;
  location: string;
  notes?: string;
  orderIndex: number;
  createdAt: Date;
}

export interface PackageRecommendation {
  id: string;
  leadId: string;
  packageId: string;
  recommendationScore: number; // 0.0 to 1.0
  reason: string;
  createdAt: Date;
}

export interface ItineraryCreationFilters {
  searchTerm: string;
  packageTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  duration: {
    min: number;
    max: number;
  };
  destinations: string[];
  operators: string[];
  rating: number;
  sortBy: 'relevance' | 'price' | 'rating' | 'duration' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface BudgetTracker {
  total: number;
  used: number;
  remaining: number;
  overBudget: boolean;
  overBudgetAmount: number;
  packageCosts: {
    [packageId: string]: number;
  };
  dailyCosts: {
    [dayId: string]: number;
  };
}

export interface ItineraryCreationState {
  // Session state
  sessionId: string;
  currentStep: ItineraryCreationStep;
  isLoading: boolean;
  error?: string;
  
  // Lead data
  lead: {
    id: string;
    customerName: string;
    email: string;
    destination: string;
    budget: number;
    tripType: string;
    travelers: number;
    duration: number;
    preferences: string[];
    specialRequirements: string[];
  };
  
  // Package selection
  availablePackages: EnhancedPackage[];
  selectedPackages: SelectedPackage[];
  packageFilters: ItineraryCreationFilters;
  packageRecommendations: PackageRecommendation[];
  
  // Day planning
  itineraryDays: ItineraryDay[];
  dayAssignments: DayAssignment[];
  
  // Budget tracking
  budget: BudgetTracker;
  
  // UI state
  selectedPackageIds: Set<string>;
  expandedDays: Set<string>;
  showRecommendations: boolean;
  showFilters: boolean;
}

export interface EnhancedPackage {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  pricing: {
    adult: number;
    child?: number;
    currency: string;
  };
  destinations: string[];
  duration: {
    days: number;
    hours: number;
  };
  operatorName: string;
  operatorId: string;
  rating: number;
  reviewCount: number;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  difficulty: string;
  groupSize: {
    min: number;
    max: number;
  };
  // Enhanced fields for itinerary creation
  recommendedForTripTypes: string[];
  averageBookingTime: number;
  seasonalAvailability: Record<string, boolean>;
  isRecommended?: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
}

export interface ItineraryCreationActions {
  // Session management
  createSession: (leadId: string) => Promise<void>;
  updateSession: (updates: Partial<ItineraryCreationSession>) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Package selection
  loadAvailablePackages: (filters?: ItineraryCreationFilters) => Promise<void>;
  addPackage: (package: EnhancedPackage) => void;
  removePackage: (packageId: string) => void;
  updatePackageQuantity: (packageId: string, quantity: number) => void;
  
  // Filtering and search
  updateFilters: (filters: Partial<ItineraryCreationFilters>) => void;
  clearFilters: () => void;
  searchPackages: (searchTerm: string) => void;
  
  // Recommendations
  loadRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  
  // Day planning
  loadItineraryDays: () => void;
  assignPackageToDay: (packageId: string, dayId: string) => void;
  removePackageFromDay: (packageId: string, dayId: string) => void;
  addCustomActivity: (dayId: string, activity: Omit<ItineraryDayActivity, 'id' | 'itineraryDayId' | 'createdAt'>) => void;
  updateActivity: (activityId: string, updates: Partial<ItineraryDayActivity>) => void;
  removeActivity: (activityId: string) => void;
  reorderActivities: (dayId: string, activityIds: string[]) => void;
  
  // Budget management
  updateBudget: () => void;
  validateBudget: () => boolean;
  
  // Navigation
  goToStep: (step: ItineraryCreationStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Save and finalize
  saveDraft: () => Promise<void>;
  finalizeItinerary: () => Promise<string>; // Returns itinerary ID
}

export interface ItineraryCreationContextType {
  state: ItineraryCreationState;
  actions: ItineraryCreationActions;
}

// Utility types
export interface PackageSearchResult {
  packages: EnhancedPackage[];
  total: number;
  hasMore: boolean;
  recommendations: PackageRecommendation[];
}

export interface DayPlanningData {
  day: ItineraryDay;
  availablePackages: EnhancedPackage[];
  assignedActivities: ItineraryDayActivity[];
  totalCost: number;
  totalDuration: number;
}

export interface ItineraryCreationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  budgetValid: boolean;
  daysValid: boolean;
  packagesValid: boolean;
}

// Export types for backward compatibility
export type {
  ItineraryDay,
  ItineraryActivity,
  ItineraryPackage,
  CustomItineraryItem
} from './agent';
