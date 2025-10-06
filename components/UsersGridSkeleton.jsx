import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for users grid - matching users page styling
export function UsersGridSkeleton() {
  return (
    <div>
      {/* Users Grid Skeleton */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 animate-pulse">
          {/* User Header Skeleton */}
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 border-2 border-gray-300 mr-3 sm:mr-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>

          {/* User Stats Skeleton */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded mr-1 sm:mr-2" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-6" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded mr-1 sm:mr-2" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-4" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
