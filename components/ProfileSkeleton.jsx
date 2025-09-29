import { Skeleton } from "@/components/ui/skeleton"
import { User, Award, Settings } from "lucide-react"

// Skeleton for profile page - matching profile page styling
export function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Profile Header Skeleton */}
          <div className="mb-4 sm:mb-8 relative">
            <div className="rounded-lg p-4 sm:p-6 min-h-[120px] sm:min-h-[150px] flex items-end relative overflow-hidden bg-gray-200 animate-pulse">
              {/* Banner Edit Button Skeleton */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                <div className="h-8 sm:h-10 w-20 sm:w-24 bg-gray-300 rounded border border-gray-400 animate-pulse"></div>
              </div>

              {/* Profile Info Skeleton */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex flex-col sm:flex-row items-center sm:items-center">
                  {/* Profile Avatar Skeleton */}
                  <div className="mb-2 sm:mb-0 sm:mr-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gray-300 border-2 sm:border-4 border-white shadow-lg animate-pulse"></div>
                  
                  <div className="text-center sm:text-left min-w-0 flex-1">
                    {/* Name Skeleton */}
                    <div className="flex items-center justify-center sm:justify-start">
                      <div className="h-6 sm:h-8 bg-gray-300 rounded w-32 sm:w-40 animate-pulse"></div>
                      <div className="ml-2 rounded-full px-1.5 sm:px-2 py-0.5 bg-gray-300 w-6 h-6 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Skeleton */}
                <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <div className="flex items-center rounded-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-300 animate-pulse">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-400 rounded mr-1 sm:mr-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-400 rounded w-16 sm:w-20"></div>
                  </div>
                  <div className="flex items-center rounded-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-300 animate-pulse">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-400 rounded mr-1 sm:mr-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-400 rounded w-12 sm:w-16"></div>
                  </div>
                  <div className="flex items-center rounded-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-300 animate-pulse">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-400 rounded mr-1 sm:mr-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-400 rounded w-12 sm:w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            {/* Mobile-Optimized Tabs - Static Text */}
            <div className="grid w-full grid-cols-3 bg-[#eef2eb] h-auto p-1 rounded-lg">
              <div className="bg-[#4a7c59] rounded-md py-3 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-0 sm:gap-2">
                <User className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
                <span className="hidden sm:inline text-sm text-white">My Profile</span>
              </div>
              <div className="py-3 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-0 sm:gap-2">
                <Award className="h-5 w-5 sm:h-4 sm:w-4 text-[#4a7c59]" />
                <span className="hidden sm:inline text-sm text-[#4a7c59]">Certifications</span>
              </div>
              <div className="py-3 sm:py-3 px-3 sm:px-4 flex items-center justify-center gap-0 sm:gap-2">
                <Settings className="h-5 w-5 sm:h-4 sm:w-4 text-[#4a7c59]" />
                <span className="hidden sm:inline text-sm text-[#4a7c59]">Settings</span>
              </div>
            </div>

            {/* Tab Content Skeleton - Shows content for active tab */}
            <div className="mt-0 border-0 p-0">
              {/* My Profile Tab Content */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Left Side - Profile Summary (2/3 width) */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Learning Progress - Static Header */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                    <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Learning Progress</h2>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 animate-pulse">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-lg bg-gray-200 p-3 sm:p-4 text-center">
                          <div className="h-6 sm:h-8 bg-gray-300 rounded w-8 mx-auto mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* My Bonsai - Static Header */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6 flex flex-col h-fit">
                    <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">My Bonsai</h2>
                    <div className="flex-1 flex flex-col justify-center animate-pulse">
                      <div className="h-60 sm:h-80 lg:h-[440px] bg-gray-200 rounded mb-4"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full mt-auto animate-pulse"></div>
                  </div>
                </div>

                {/* Right Sidebar (1/3 width) */}
                <div className="lg:col-span-1 flex flex-col h-full">
                  <div className="space-y-4 sm:space-y-6 flex-1">
                    {/* Social Links - Static Header */}
                    <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">Social Links</h2>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="space-y-2 animate-pulse">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="p-3 sm:p-4 rounded-lg bg-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                            <div className="h-3 bg-gray-300 rounded w-32"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Achievement - Static Header */}
                    <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                      <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Recent Achievement</h2>
                      <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-200 animate-pulse">
                        <div className="h-6 w-6 bg-gray-300 rounded mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
                      </div>
                    </div>

                    {/* Quick Stats - Static Header */}
                    <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                      <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Quick Stats</h2>
                      <div className="space-y-3 sm:space-y-4 animate-pulse">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-200">
                            <div className="flex items-center">
                              <div className="h-4 w-4 bg-gray-300 rounded mr-2 sm:mr-3"></div>
                              <div className="h-4 bg-gray-300 rounded w-16 sm:w-20"></div>
                            </div>
                            <div className="h-6 bg-gray-300 rounded w-8"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
