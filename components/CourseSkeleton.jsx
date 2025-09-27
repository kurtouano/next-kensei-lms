import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for course page - matching courses styling
export function CoursePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Video Player Skeleton */}
              <div className="mb-8">
                <div className="aspect-video w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Course Info Skeleton */}
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="mb-8">
                <div className="flex gap-4 mb-6">
                  <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
                
                {/* Tab Content */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
