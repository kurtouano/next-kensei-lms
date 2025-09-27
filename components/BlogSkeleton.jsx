import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Skeleton for individual blog card - matching courses styling
export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
        <div className="absolute top-3 right-3">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for blog grid layout
export function BlogGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Skeleton for sidebar popular posts - matching courses styling
export function PopularPostsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for newsletter signup - matching courses styling
export function NewsletterSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-32 mt-3 mx-auto animate-pulse"></div>
      </div>
    </div>
  )
}

// Skeleton for search and filter bar
export function SearchBarSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="lg:w-48 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}

// Main blogs page skeleton
export function BlogsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <SearchBarSkeleton />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles Section */}
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <BlogGridSkeleton count={4} />
            </div>

            {/* Recent Articles Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 rounded w-36 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <BlogGridSkeleton count={8} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="top-[70px] space-y-6">
              <NewsletterSkeleton />
              <PopularPostsSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
