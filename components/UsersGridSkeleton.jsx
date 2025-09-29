import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Search } from "lucide-react"

// Skeleton for users grid - matching users page styling
export function UsersGridSkeleton() {
  return (
    <div className="mb-6">
      {/* Find Friends Section Header - Static */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-[#4a7c59]" />
          <h2 className="text-lg font-semibold text-[#2c3e2d]">Find Friends</h2>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 text-sm pr-4 py-2 border border-[#dce4d7] rounded-lg bg-white text-[#2c3e2d] placeholder-[#5c6d5e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            disabled
          />
        </div>
      </div>

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
