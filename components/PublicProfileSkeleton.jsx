import { Skeleton } from "@/components/ui/skeleton"
import { User, Award, BookOpen, Flag, MessageCircle, UserPlus } from "lucide-react"

// Skeleton for public profile page - matching public profile styling
export function PublicProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Back Button Skeleton */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-[#4a7c59] hover:text-[#3a6147] transition-colors">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>

          {/* Profile Header Skeleton */}
          <div className="mb-4 sm:mb-8 relative">
            <div className="rounded-lg p-4 sm:p-6 min-h-[120px] sm:min-h-[150px] flex items-end relative overflow-hidden bg-gray-200 animate-pulse">
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
                
                {/* Action Buttons Skeleton */}
                <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="h-8 sm:h-10 bg-gray-300 rounded w-20 sm:w-24 animate-pulse"></div>
                  <div className="h-8 sm:h-10 bg-gray-300 rounded w-16 sm:w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content Skeleton */}
          <div className="space-y-6">
            {/* Basic Info Skeleton */}
            <div className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-18"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-18 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates Skeleton */}
            <div className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
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
