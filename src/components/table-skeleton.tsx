import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  /**
   * Number of rows to display
   * @default 5
   */
  rows?: number;

  /**
   * Number of columns to display
   * @default 4
   */
  columns?: number;

  /**
   * Show search bar skeleton
   * @default true
   */
  showSearch?: boolean;

  /**
   * Show filters skeleton
   * @default false
   */
  showFilters?: boolean;
}

/**
 * Loading skeleton for data tables
 *
 * Displays a realistic loading state while data is being fetched
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showSearch = true,
  showFilters = false,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Search and filters skeleton */}
      {(showSearch || showFilters) && (
        <div className="flex items-center gap-2">
          {showSearch && <Skeleton className="h-10 w-full max-w-sm" />}
          {showFilters && <Skeleton className="h-10 w-32" />}
        </div>
      )}

      {/* Table skeleton */}
      <div className="rounded-md border">
        {/* Header */}
        <div className="bg-muted/50 border-b p-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 flex-1"
                  style={{
                    width: colIndex === 0 ? '30%' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
