import { Skeleton } from "@/components/ui/skeleton"
import { Bell, MoreVertical } from "lucide-react"

// Skeleton for notifications page - matching notifications page styling
export function NotificationsSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Static */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-[#4a7c59]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#2c3e2d]">Notifications</h1>
            </div>
            <p className="text-[#5c6d5e] text-sm sm:text-base">
              Stay updated with friend requests and activities
            </p>
          </div>

          {/* Actions Menu - Static */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#2c3e2d]">All Notifications</span>
              </div>
              <div className="relative">
                <button className="p-2 rounded-lg border border-[#dce4d7] bg-white hover:bg-[#f8f7f4] transition-colors">
                  <MoreVertical className="h-4 w-4 text-[#4a7c59]" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List Skeleton */}
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 animate-pulse">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Notification Icon Skeleton */}
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Notification Content Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {/* Notification Title */}
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        {/* Notification Message */}
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      </div>
                      
                      {/* Actions Skeleton */}
                      <div className="flex items-center gap-2 ml-2">
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Notification Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button Skeleton */}
          <div className="text-center pt-4">
            <div className="h-8 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
