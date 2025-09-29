import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CoursesSkeleton() {
  return (
    <>
      {/* Page Header - Static Text */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Course Catalog</h1>
        <p className="text-[#5c6d5e]">Browse our comprehensive selection of Japanese language courses</p>
      </div>

      {/* Search and Filter Section - Mixed Static and Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar - Static */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses by title, instructor, or level..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
              disabled
            />
          </div>

          {/* Filter Button - Static */}
          <Button
            variant="outline"
            className="flex items-center gap-2 py-1 border-gray-300 hover:bg-gray-50"
            disabled
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Course Count - Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse mb-6"></div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="aspect-[16/10] w-full bg-gray-200 animate-pulse"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
