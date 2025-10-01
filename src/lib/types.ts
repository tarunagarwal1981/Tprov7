// ===== USER ROLES =====
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TOUR_OPERATOR = 'TOUR_OPERATOR',
  TRAVEL_AGENT = 'TRAVEL_AGENT',
}

// ===== TRANSFER SYSTEM ENUMS =====
export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  HATCHBACK = 'HATCHBACK',
  LUXURY_SEDAN = 'LUXURY_SEDAN',
  TEMPO_TRAVELLER = 'TEMPO_TRAVELLER',
  BUS = 'BUS',
  CUSTOM = 'CUSTOM'
}

export enum TransferServiceType {
  POINT_TO_POINT = 'POINT_TO_POINT',
  AIRPORT_TRANSFER = 'AIRPORT_TRANSFER',
  CITY_TOUR = 'CITY_TOUR',
  HOURLY_RENTAL = 'HOURLY_RENTAL'
}

// ===== USER INTERFACES =====
export interface User {
  id: string;
  email: string;
  password?: string; // Optional password field for mock authentication
  name: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

// ===== TOUR OPERATOR INTERFACES =====
export interface TourOperator {
  id: string;
  userId: string;
  companyName: string;
  companyDetails: CompanyDetails;
  commissionRates: CommissionRates;
  licenses: License[];
  certifications: Certification[];
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDetails {
  legalName: string;
  registrationNumber: string;
  taxId: string;
  website?: string;
  description: string;
  foundedYear?: number;
  employeeCount?: number;
  specialties: string[];
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  email: string;
  phone: string;
  fax?: string;
  address: Address;
  emergencyContact?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface CommissionRates {
  domestic: number; // percentage
  international: number; // percentage
  groupDiscount: number; // percentage
  seasonalAdjustment: number; // percentage
}

export interface License {
  id: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
  documents: string[]; // URLs to license documents
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  documents: string[]; // URLs to certification documents
}

// ===== PACKAGE INTERFACES =====
export enum PackageType {
  ACTIVITY = 'ACTIVITY',
  TRANSFERS = 'TRANSFERS',
  MULTI_CITY_PACKAGE = 'MULTI_CITY_PACKAGE',
  MULTI_CITY_PACKAGE_WITH_HOTEL = 'MULTI_CITY_PACKAGE_WITH_HOTEL',
  FIXED_DEPARTURE_WITH_FLIGHT = 'FIXED_DEPARTURE_WITH_FLIGHT',
}

export enum PackageStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface Package {
  id: string;
  tourOperatorId: string;
  title: string;
  description: string;
  type: PackageType;
  status: PackageStatus;
  pricing: PackagePricing;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  termsAndConditions: string[];
  cancellationPolicy: CancellationPolicy;
  images: string[];
  destinations: string[];
  duration: PackageDuration;
  groupSize: GroupSize;
  difficulty: DifficultyLevel;
  tags: string[];
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  
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
  ageRestrictions?: AgeRestrictions;
  importantInfo?: string;
  faq?: FAQ[];
  variants?: PackageVariant[];
  
  // Transfer-specific fields
  transferServiceType?: TransferServiceType;
  distanceKm?: number;
  estimatedDuration?: string;
  advanceBookingHours?: number;
  cancellationPolicyText?: string;
  vehicleConfigs?: VehicleConfig[];
  pickupPoints?: PickupPoint[];
  dropoffPoints?: PickupPoint[];
  additionalServices?: AdditionalService[];
}

export interface PackagePricing {
  basePrice: number;
  currency: string;
  pricePerPerson: boolean;
  groupDiscounts: GroupDiscount[];
  seasonalPricing: SeasonalPricing[];
  inclusions: string[];
  taxes: TaxBreakdown;
  fees: FeeBreakdown;
}

export interface GroupDiscount {
  minGroupSize: number;
  maxGroupSize?: number;
  discountPercentage: number;
  discountAmount?: number;
}

export interface SeasonalPricing {
  season: string;
  startDate: Date;
  endDate: Date;
  priceMultiplier: number;
  reason: string;
}

export interface PricingInclusion {
  item: string;
  included: boolean;
  additionalCost?: number;
}

export interface TaxBreakdown {
  gst: number;
  serviceTax: number;
  tourismTax: number;
  other: { name: string; amount: number }[];
}

export interface FeeBreakdown {
  bookingFee: number;
  processingFee: number;
  cancellationFee: number;
  other: { name: string; amount: number }[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
  transportation?: Transportation;
  highlights?: string[];
  duration?: string;
  difficulty?: DifficultyLevel;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  location: string;
  type: ActivityType;
  difficulty: DifficultyLevel;
  requirements: string[];
  equipment: string[];
  cost?: number;
}

export enum ActivityType {
  SIGHTSEEING = 'SIGHTSEEING',
  ADVENTURE = 'ADVENTURE',
  CULTURAL = 'CULTURAL',
  RELAXATION = 'RELAXATION',
  EDUCATIONAL = 'EDUCATIONAL',
  SPORTS = 'SPORTS',
  NIGHTLIFE = 'NIGHTLIFE',
  SHOPPING = 'SHOPPING',
  FOOD = 'FOOD',
  NATURE = 'NATURE',
}

export interface Meal {
  type: MealType;
  description: string;
  location?: string;
  included: boolean;
  cost?: number;
  dietaryOptions: string[];
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  BRUNCH = 'BRUNCH',
  HIGH_TEA = 'HIGH_TEA',
}

export interface Accommodation {
  name: string;
  type: AccommodationType;
  location: string;
  rating?: number;
  amenities: string[];
  roomType: string;
  occupancy: number;
  checkIn?: Date;
  checkOut?: Date;
  included: boolean;
  cost?: number;
}

export enum AccommodationType {
  HOTEL = 'HOTEL',
  RESORT = 'RESORT',
  HOSTEL = 'HOSTEL',
  VILLA = 'VILLA',
  APARTMENT = 'APARTMENT',
  CAMPING = 'CAMPING',
  HOMESTAY = 'HOMESTAY',
  CRUISE = 'CRUISE',
}

export interface Transportation {
  type: TransportationType;
  description: string;
  duration: string;
  distance?: number;
  included: boolean;
  cost?: number;
  provider?: string;
}

export enum TransportationType {
  FLIGHT = 'FLIGHT',
  TRAIN = 'TRAIN',
  BUS = 'BUS',
  CAR = 'CAR',
  TAXI = 'TAXI',
  BOAT = 'BOAT',
  CRUISE = 'CRUISE',
  HELICOPTER = 'HELICOPTER',
  WALKING = 'WALKING',
}

export interface PackageImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  highlights: string[];
  bestTimeToVisit: string[];
  weather: WeatherInfo;
}

export interface WeatherInfo {
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  conditions: string[];
  bestMonths: string[];
}

export interface PackageDuration {
  days: number;
  nights: number;
  totalHours?: number;
}

export interface GroupSize {
  min: number;
  max: number;
  ideal: number;
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  CHALLENGING = 'CHALLENGING',
  EXPERT = 'EXPERT',
}

export interface CancellationPolicy {
  freeCancellationDays: number;
  cancellationFees: CancellationFee[];
  refundPolicy: RefundPolicy;
  forceMajeurePolicy: string;
}

export interface CancellationFee {
  daysBeforeTravel: number;
  feePercentage: number;
  feeAmount?: number;
}

export interface RefundPolicy {
  refundable: boolean;
  refundPercentage: number;
  processingDays: number;
  conditions: string[];
}

// ===== BOOKING INTERFACES =====
export interface Booking {
  id: string;
  packageId: string;
  userId: string;
  travelAgentId?: string;
  status: BookingStatus;
  travelers: Traveler[];
  pricing: BookingPricing;
  dates: BookingDates;
  specialRequests: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: Date;
  dietaryRequirements?: string[];
  medicalConditions?: string[];
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface BookingPricing {
  basePrice: number;
  totalPrice: number;
  currency: string;
  discounts: Discount[];
  taxes: number;
  fees: number;
  finalAmount: number;
}

export interface Discount {
  type: string;
  amount: number;
  reason: string;
}

export interface BookingDates {
  departure: Date;
  return: Date;
  flexible: boolean;
  alternativeDates?: Date[];
}

// ===== REVIEW INTERFACES =====
export interface Review {
  id: string;
  packageId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== API RESPONSE INTERFACES =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== FORM INTERFACES =====
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== CONSTANTS =====
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'] as const;
export const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'] as const;
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const;

export type Currency = typeof CURRENCIES[number];
export type Language = typeof LANGUAGES[number];
export type Timezone = typeof TIMEZONES[number];

// ===== ACTIVITY PACKAGE SPECIFIC INTERFACES =====

export interface OperationalHours {
  startTime: string;
  endTime: string;
  timeSlots?: TimeSlot[];
  operationalDays: string[];
  breaks?: BreakPeriod[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  isActive: boolean;
}

export interface BreakPeriod {
  startTime: string;
  endTime: string;
  reason: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  availableHours: string;
  languages: string[];
}

export interface AgeRestrictions {
  minAge?: number;
  maxAge?: number;
  childPolicy: string;
  infantPolicy: string;
  seniorPolicy?: string;
  ageVerificationRequired: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

export interface PackageVariant {
  id: string;
  packageId: string;
  variantName: string;
  description?: string;
  inclusions: string[];
  exclusions: string[];
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  minGuests: number;
  maxGuests?: number;
  isActive: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Categories
export enum ActivityCategory {
  SIGHTSEEING = 'SIGHTSEEING',
  AQUARIUM = 'AQUARIUM',
  FAMILY = 'FAMILY',
  ADVENTURE = 'ADVENTURE',
  CULTURAL = 'CULTURAL',
  EDUCATIONAL = 'EDUCATIONAL',
  ENTERTAINMENT = 'ENTERTAINMENT',
  NATURE = 'NATURE',
  SPORTS = 'SPORTS',
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  RELAXATION = 'RELAXATION',
  NIGHTLIFE = 'NIGHTLIFE',
  RELIGIOUS = 'RELIGIOUS',
  HISTORICAL = 'HISTORICAL',
  ART = 'ART',
  MUSIC = 'MUSIC',
  THEME_PARK = 'THEME_PARK',
  ZOO = 'ZOO',
  MUSEUM = 'MUSEUM',
  OTHER = 'OTHER'
}

// Transfer Options
export enum TransferOption {
  TICKET_ONLY = 'TICKET_ONLY',
  PRIVATE_TRANSFER = 'PRIVATE_TRANSFER',
  SHARED_TRANSFER = 'SHARED_TRANSFER',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  WALKING_DISTANCE = 'WALKING_DISTANCE',
  HOTEL_PICKUP = 'HOTEL_PICKUP',
  AIRPORT_PICKUP = 'AIRPORT_PICKUP',
  CUSTOM_LOCATION = 'CUSTOM_LOCATION'
}

// ===== TRANSFER SYSTEM INTERFACES =====
export interface VehicleConfig {
  id?: string;
  vehicleType: VehicleType | string; // Allow custom types
  name: string;
  minPassengers: number;
  maxPassengers: number;
  basePrice: number;
  perKmRate?: number;
  perHourRate?: number;
  features: string[];
  description?: string;
  images?: string[];
  isActive: boolean;
  orderIndex: number;
  transferType?: 'ONEWAY' | 'TWOWAY';
}

export interface PickupPoint {
  id?: string;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  landmarkNotes?: string;
  isActive: boolean;
}

export interface AdditionalService {
  id?: string;
  name: string;
  price: number;
  description?: string;
  isOptional: boolean;
  isActive: boolean;
}

// Days of Week
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// Re-export wizard types
export * from './types/wizard';