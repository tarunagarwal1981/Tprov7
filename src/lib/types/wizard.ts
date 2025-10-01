import { Package, PackageType, PackageStatus, DifficultyLevel, PackageDuration, GroupSize, PackagePricing, ItineraryDay, OperationalHours, EmergencyContact, AgeRestrictions, FAQ, PackageVariant } from '@/lib/types';

// Additional interfaces for the expanded form data
export interface GroupDiscount {
  minGroupSize: number;
  maxGroupSize?: number;
  discountPercentage: number;
  discountAmount?: number;
}

export interface SeasonalPricing {
  season: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  additionalCharges?: number;
}

export interface ValidityDates {
  startDate: string;
  endDate: string;
  blackoutDates?: string[];
}

export interface CancellationPolicy {
  freeCancellationDays: number;
  cancellationFees: CancellationFee[];
  forceMajeurePolicy: string;
}

export interface CancellationFee {
  daysBeforeTravel: number;
  feePercentage: number;
}

export interface RefundPolicy {
  refundable: boolean;
  refundPercentage: number;
  processingDays: number;
  conditions: string[];
}

// Wizard Step Types
export type WizardStep = 
  | 'package-type'
  | 'basic-info'
  | 'location-timing'
  | 'detailed-planning'
  | 'inclusions-exclusions'
  | 'pricing-policies'
  | 'review';

// Step Configuration
export interface StepConfig {
  id: WizardStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isAccessible: boolean;
  order: number;
}

// Package Creation Form Data
export interface PackageFormData {
  // Step 1: Package Type
  type: PackageType;
  
  // Step 2: Basic Information
  title: string;
  description: string;
  shortDescription: string;
  bannerImage: string;
  additionalImages: string[];
  additionalNotes: string;
  
  // Step 3: Location & Timing
  place: string;
  fromLocation?: string;
  toLocation?: string;
  multipleDestinations: string[];
  pickupPoints: string[];
  durationHours?: number;
  durationDays?: number;
  startTime?: string;
  endTime?: string;
  timingNotes: string;
  
  // Step 4: Detailed Planning
  itinerary: ItineraryDay[];
  activitiesPerDay: string[];
  mealPlanPerDay: string[];
  freeTimeLeisure: string[];
  
  // Accommodation (for Land Package with Hotel, Fixed Departure with Flight, Multi-City Tour)
  hotelCategory?: string;
  roomType?: string;
  hotelNameOptions?: string[];
  checkInCheckOut?: string;
  
  // Transportation
  vehicleType: string;
  acNonAc: string;
  driverDetails?: string;
  fuelInclusion: boolean;
  
  // Flights (for Fixed Departure with Flight)
  departureAirport?: string;
  arrivalAirport?: string;
  flightClass?: string;
  airlinePreference?: string;
  baggageAllowance?: string;
  
  // Step 5: Inclusions & Exclusions
  tourInclusions: string[];
  mealInclusions: string[];
  entryTickets: string[];
  guideServices: string[];
  insurance: string[];
  tourExclusions: string[];
  personalExpenses: string[];
  optionalActivities: string[];
  visaDocumentation: string[];
  
  // Step 6: Pricing & Policies
  adultPrice: number;
  childPrice: number;
  infantPrice?: number;
  seniorCitizenPrice?: number;
  groupDiscounts: GroupDiscount[];
  seasonalPricing: SeasonalPricing[];
  validityDates: ValidityDates;
  currency: string;
  
  // Booking Policies
  minGroupSize: number;
  maxGroupSize: number;
  advanceBookingDays: number;
  cancellationPolicy: CancellationPolicy;
  refundPolicy: RefundPolicy;
  paymentTerms: string[];
  
  // Additional Fields
  ageRestrictions: string[];
  physicalRequirements: string[];
  specialEquipment: string[];
  weatherDependency: string[];
  languageOptions: string[];
  dressCode: string[];
  
  // Activity-specific fields
  activityCategory?: string;
  availableDays?: string[];
  operationalHours?: OperationalHours;
  meetingPoint?: string;
  emergencyContact?: EmergencyContact;
  transferOptions?: string[];
  maxCapacity?: number;
  languagesSupported?: string[];
  accessibilityInfo?: string[];
  ageRestrictionsDetailed?: AgeRestrictions;
  importantInfo?: string;
  faq?: FAQ[];
  variants?: PackageVariant[];
  
  // Legacy fields (keeping for compatibility)
  difficulty: DifficultyLevel;
  groupSize: GroupSize;
  tags: string[];
  isFeatured: boolean;
  category: string;
  termsAndConditions: string[];
  pricing: PackagePricing;
  images: string[];
  coverImage: string;
  status: PackageStatus;
  publishDate?: Date;
}

// Wizard State
export interface WizardState {
  currentStep: WizardStep;
  steps: StepConfig[];
  formData: Partial<PackageFormData>;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  errors: Record<string, string[]>;
  isValid: boolean;
  draftId?: string; // ID of the saved draft package
}

// Wizard Actions
export interface WizardActions {
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (data: Partial<PackageFormData>) => void;
  saveDraft: () => Promise<void>;
  publishPackage: () => Promise<PackageCreationResult>;
  resetWizard: () => void;
  disableAutoSave: () => void;
  enableAutoSave: () => void;
}

// Step Component Props
export interface StepProps {
  formData: Partial<PackageFormData>;
  updateFormData: (data: Partial<PackageFormData>) => void;
  errors: Record<string, string[]>;
  isValid: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
  onPublish?: () => Promise<PackageCreationResult>;
}

// Auto-save Configuration
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  onSave: (data: Partial<PackageFormData>) => Promise<void>;
}

// Exit Confirmation Props
export interface ExitConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  hasUnsavedChanges: boolean;
}

// Validation Rules
export interface ValidationRule {
  field: keyof PackageFormData;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Step Validation Configuration
export interface StepValidation {
  step: WizardStep;
  rules: ValidationRule[];
}

// Draft Package Interface
export interface DraftPackage {
  id: string;
  formData: Partial<PackageFormData>;
  createdAt: Date;
  updatedAt: Date;
  lastStep: WizardStep;
  isPublished: boolean;
}

// Package Creation Result
export interface PackageCreationResult {
  success: boolean;
  package?: Package;
  errors?: Record<string, string[]>;
  message?: string;
}
