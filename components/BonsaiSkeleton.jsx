import { Skeleton } from "@/components/ui/skeleton"

// Skeleton for bonsai page - matching courses styling
export function BonsaiPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-80 animate-pulse mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Level Progress Bar Skeleton */}
          <div className="mb-8 rounded-lg border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left sm:text-right">
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Tab Content Skeleton */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Bonsai Preview Skeleton */}
              <div className="md:sticky md:top-20 md:self-start md:h-fit">
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm min-h-[500px] flex flex-col justify-center">
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-6 animate-pulse"></div>
                  <div className="flex flex-col items-center flex-1 justify-center">
                    <div className="mb-6">
                      <div className="h-64 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Options Skeleton */}
              <div className="md:col-span-2 space-y-6">
                {/* Tree Customization */}
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>

                {/* Pot Customization */}
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>

                {/* Decorations */}
                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-28 mb-4 animate-pulse"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index}>
                        <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 4 }).map((_, subIndex) => (
                            <div key={subIndex} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                  <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
