import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, Search, Award } from "lucide-react"

export function MyLearningSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header - Mixed Static and Skeleton */}
          <div className="mb-8">
            <h1 className="text-2xl mb-2 font-bold text-gray-900">
              Welcome back, <Skeleton className="inline-block h-6 w-40 bg-gray-200" />
            </h1>
            <p className="text-gray-600">Continue your Japanese learning journey</p>
          </div>

          {/* In Progress Section - Static Text */}
          <div className="mb-12 mt-8 pt-8 border-t border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">In Progress</h2>
              </div>
            </div>

            {/* Course Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                  <div className="aspect-video w-full h-full bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Section - Static Text */}
          <div className="mb-12 mt-8 pt-8 border-t border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Completed</h2>
              </div>
            </div>

            {/* Course Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                  <div className="aspect-video w-full h-full bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Static Text */}
          <div className="bg-[#eef2eb] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white"
                disabled
              >
                <Search className="mr-2 h-4 w-4" />
                Browse More Courses
              </Button>
              <Button 
                variant="outline" 
                className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white"
                disabled
              >
                <Award className="mr-2 h-4 w-4" />
                View Certificates
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
