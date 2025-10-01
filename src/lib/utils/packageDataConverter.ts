import { PackageWithDetails } from '@/lib/supabase-types';
import { PackageFormData } from '@/lib/types/wizard';
import { PackageType } from '@/lib/types';

export function convertDbPackageToFormData(dbPackage: PackageWithDetails): PackageFormData {
  // Extract pricing information
  const pricing = dbPackage.pricing as any || {};
  const duration = dbPackage.duration as any || {};
  const groupSize = dbPackage.group_size as any || {};
  const itinerary = dbPackage.itinerary as any || [];
  const cancellationPolicy = dbPackage.cancellation_policy as any || {};

  return {
    // Package Type
    type: dbPackage.type as PackageType,
    
    // Basic Information
    title: dbPackage.title || '',
    description: dbPackage.description || '',
    shortDescription: '', // Not stored in DB, will be empty
    bannerImage: dbPackage.images?.[0] || '',
    additionalImages: dbPackage.images?.slice(1) || [],
    additionalNotes: '',
    
    // Location & Timing
    place: dbPackage.destinations?.[0] || '',
    fromLocation: '', // Not stored in DB
    toLocation: '', // Not stored in DB
    multipleDestinations: dbPackage.destinations || [],
    pickupPoints: [], // Not stored in DB
    durationHours: duration.hours || 0,
    durationDays: duration.days || 0,
    startTime: '', // Not stored in DB
    endTime: '', // Not stored in DB
    timingNotes: '',
    
    // Detailed Planning
    itinerary: Array.isArray(itinerary) ? itinerary : [],
    activitiesPerDay: [], // Not stored in DB
    mealPlanPerDay: [], // Not stored in DB
    freeTimeLeisure: [], // Not stored in DB
    
    // Accommodation
    hotelCategory: '', // Not stored in DB
    roomType: '', // Not stored in DB
    hotelNameOptions: [], // Not stored in DB
    checkInCheckOut: '', // Not stored in DB
    
    // Transportation
    vehicleType: '', // Not stored in DB
    acNonAc: '', // Not stored in DB
    driverDetails: '', // Not stored in DB
    fuelInclusion: false, // Not stored in DB
    
    // Flights
    departureAirport: '', // Not stored in DB
    arrivalAirport: '', // Not stored in DB
    flightClass: '', // Not stored in DB
    airlinePreference: '', // Not stored in DB
    baggageAllowance: '', // Not stored in DB
    
    // Inclusions & Exclusions
    tourInclusions: dbPackage.inclusions || [],
    mealInclusions: [], // Not stored in DB
    entryTickets: [], // Not stored in DB
    guideServices: [], // Not stored in DB
    insurance: [], // Not stored in DB
    tourExclusions: dbPackage.exclusions || [],
    personalExpenses: [], // Not stored in DB
    optionalActivities: [], // Not stored in DB
    visaDocumentation: [], // Not stored in DB
    
    // Pricing & Policies
    adultPrice: pricing.basePrice || 0,
    childPrice: 0, // Not stored in DB
    infantPrice: 0, // Not stored in DB
    seniorCitizenPrice: 0, // Not stored in DB
    groupDiscounts: pricing.groupDiscounts || [],
    seasonalPricing: pricing.seasonalPricing || [],
    validityDates: {
      startDate: '',
      endDate: '',
      blackoutDates: []
    },
    currency: pricing.currency || 'USD',
    
    // Booking Policies
    minGroupSize: groupSize.min || 0,
    maxGroupSize: groupSize.max || 0,
    advanceBookingDays: 0, // Not stored in DB
    cancellationPolicy: cancellationPolicy || {
      freeCancellationDays: 0,
      cancellationFees: [],
      forceMajeurePolicy: ''
    },
    refundPolicy: {
      refundable: true,
      refundPercentage: 100,
      processingDays: 7,
      conditions: []
    },
    paymentTerms: [], // Not stored in DB
    
    // Additional Fields
    ageRestrictions: [], // Not stored in DB
    physicalRequirements: [], // Not stored in DB
    specialEquipment: [], // Not stored in DB
    weatherDependency: [], // Not stored in DB
    languageOptions: [], // Not stored in DB
    dressCode: [], // Not stored in DB
    
    // Legacy fields
    difficulty: dbPackage.difficulty as any || 'EASY',
    groupSize: groupSize,
    tags: dbPackage.tags || [],
    isFeatured: dbPackage.is_featured || false,
    category: '', // Not stored in DB
    termsAndConditions: dbPackage.terms_and_conditions || [],
    pricing: pricing,
    images: dbPackage.images || [],
    coverImage: dbPackage.images?.[0] || '',
    status: dbPackage.status as any || 'DRAFT'
  };
}

export function getPackageTypeSpecificFields(packageType: PackageType) {
  const baseFields = [
    'title', 'description', 'shortDescription', 'bannerImage', 'additionalImages',
    'place', 'multipleDestinations', 'durationHours', 'durationDays',
    'itinerary', 'tourInclusions', 'tourExclusions',
    'adultPrice', 'childPrice', 'currency',
    'minGroupSize', 'maxGroupSize', 'cancellationPolicy',
    'difficulty', 'tags', 'status'
  ];

  const typeSpecificFields: Record<PackageType, string[]> = {
    [PackageType.ACTIVITY]: [
      ...baseFields,
      'startTime', 'endTime', 'timingNotes',
      'activitiesPerDay', 'mealPlanPerDay',
      'vehicleType', 'acNonAc', 'driverDetails',
      'ageRestrictions', 'physicalRequirements', 'specialEquipment'
    ],
    [PackageType.TRANSFERS]: [
      ...baseFields,
      'fromLocation', 'toLocation', 'pickupPoints',
      'vehicleType', 'acNonAc', 'driverDetails', 'fuelInclusion',
      'startTime', 'endTime', 'timingNotes'
    ],
    [PackageType.MULTI_CITY_PACKAGE]: [
      ...baseFields,
      'fromLocation', 'toLocation', 'pickupPoints',
      'vehicleType', 'acNonAc', 'driverDetails', 'fuelInclusion',
      'activitiesPerDay', 'mealPlanPerDay', 'freeTimeLeisure',
      'ageRestrictions', 'physicalRequirements', 'specialEquipment',
      'weatherDependency', 'languageOptions', 'dressCode',
      'visaDocumentation'
    ],
    [PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL]: [
      ...baseFields,
      'fromLocation', 'toLocation', 'pickupPoints',
      'hotelCategory', 'roomType', 'hotelNameOptions', 'checkInCheckOut',
      'vehicleType', 'acNonAc', 'driverDetails', 'fuelInclusion',
      'activitiesPerDay', 'mealPlanPerDay', 'freeTimeLeisure',
      'ageRestrictions', 'physicalRequirements', 'specialEquipment',
      'weatherDependency', 'languageOptions', 'dressCode',
      'visaDocumentation', 'advanceBookingDays', 'paymentTerms'
    ],
    [PackageType.FIXED_DEPARTURE_WITH_FLIGHT]: [
      ...baseFields,
      'fromLocation', 'toLocation', 'pickupPoints',
      'hotelCategory', 'roomType', 'hotelNameOptions', 'checkInCheckOut',
      'departureAirport', 'arrivalAirport', 'flightClass', 
      'airlinePreference', 'baggageAllowance',
      'vehicleType', 'acNonAc', 'driverDetails', 'fuelInclusion',
      'activitiesPerDay', 'mealPlanPerDay', 'freeTimeLeisure',
      'ageRestrictions', 'physicalRequirements', 'specialEquipment',
      'weatherDependency', 'languageOptions', 'dressCode',
      'visaDocumentation', 'advanceBookingDays', 'paymentTerms'
    ]
  };

  return typeSpecificFields[packageType] || baseFields;
}
