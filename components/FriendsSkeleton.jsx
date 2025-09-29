import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

// Skeleton for friends section - matching users page styling
export function FriendsSkeleton() {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-row items-center gap-2">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          
          {/* Friends Search Input - Static */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-10 text-sm pr-4 py-2 border border-[#dce4d7] rounded-lg bg-white text-[#2c3e2d] placeholder-[#5c6d5e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              disabled
            />
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Left Blur Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[rgb(248,247,244)] to-transparent z-20 pointer-events-none" />
        
        {/* Right Blur Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[rgb(248,247,244)] to-transparent z-20 pointer-events-none" />
        
        {/* Left Arrow Skeleton */}
        <div className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white border border-[#dce4d7] shadow-sm">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Right Arrow Skeleton */}
        <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white border border-[#dce4d7] shadow-sm">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div 
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 px-11 sm:px-16"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[120px] sm:min-w-[155px] animate-pulse"
            >
              {/* Friend Avatar Skeleton */}
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-200 border-2 border-gray-300" />
              
              {/* Friend Name Skeleton */}
              <div className="h-4 bg-gray-200 rounded w-20 sm:w-24" />
              
              {/* Last seen skeleton */}
              <div className="h-3 bg-gray-200 rounded w-16" />
              
              {/* Message Button Skeleton */}
              <div className="mt-1 h-6 sm:h-7 bg-gray-200 rounded-lg w-16 sm:w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
