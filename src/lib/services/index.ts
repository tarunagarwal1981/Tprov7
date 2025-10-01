// Export all services
export { packageService, PackageService } from './packageService';
export { dashboardService, DashboardService } from './dashboardService';
export { BookingService } from './bookingService';
export { UserService } from './userService';

// Export service types
export type {
  ServiceResponse,
  PaginatedResponse,
  PackageFilters,
  PackageSearchParams
} from './packageService';

export type {
  DashboardOverview,
  PerformanceMetrics,
  TimeRange
} from './dashboardService';
