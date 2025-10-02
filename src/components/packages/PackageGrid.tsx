'use client';

import { Package } from '@/lib/types';
import PackageCard from './PackageCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package as PackageIcon, 
  AlertCircle, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PackageGridProps {
  packages: Package[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function PackageGrid({ 
  packages, 
  loading, 
  error, 
  viewMode, 
  pagination,
  onPageChange 
}: PackageGridProps) {
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        <div className="bg-gray-200 h-4 rounded w-1/4"></div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first travel package or adjust your search filters.
        </p>
        <Button 
          onClick={() => window.location.href = '/operator/packages/create'}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Package
        </Button>
      </CardContent>
    </Card>
  );

  // Error state component
  const ErrorState = ({ error }: { error: string }) => (
    <Card className="text-center py-12">
      <CardContent>
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading packages</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </CardContent>
    </Card>
  );

  // Loading state
  if (loading && packages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (!loading && packages.length === 0) {
    return <EmptyState />;
  }

  // Pagination component
  const Pagination = () => {
    const { page, totalPages } = pagination;
    
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (page <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (page >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = page - 1; i <= page + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} packages
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((pageNum, index) => (
              <Button
                key={index}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
                disabled={pageNum === '...'}
                className={pageNum === '...' ? 'cursor-default' : ''}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {pagination.total} {pagination.total === 1 ? 'Package' : 'Packages'}
          </h2>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          Page {pagination.page} of {pagination.totalPages}
        </div>
      </div>

      {/* Packages Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              package={pkg} 
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              package={pkg} 
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
