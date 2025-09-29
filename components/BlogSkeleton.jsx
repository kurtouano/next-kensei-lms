import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

// Skeleton for sidebar popular posts - Mixed Static and Skeleton
export function PopularPostsSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">Popular Posts</h3>
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
      </CardContent>
    </Card>
  )
}

// Skeleton for newsletter signup - Mixed Static and Skeleton
export function NewsletterSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <h3 className="font-bold text-gray-900 mb-2">Stay Updated with Japanese Learning</h3>
        <p className="text-sm text-gray-600 mb-4">Get notified when we publish new blog posts about Japanese language, culture, and learning tips.</p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
            disabled
          />
          <Button 
            className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white"
            disabled
          >
            Subscribe
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">We respect your privacy. Unsubscribe at any time.</p>
      </CardContent>
    </Card>
  )
}

// Skeleton for search and filter bar - Mixed Static and Skeleton
export function SearchBarSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar - Static */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search articles, tags, authors, or topics..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
            disabled
          />
        </div>

        {/* Sort Dropdown - Static */}
        <div className="lg:w-48">
          <select
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
            disabled
          >
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
      
      {/* Category Filter Row - Mixed Static and Skeleton */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* All Categories - Static (selected) */}
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#4a7c59] text-white shadow-md"
            disabled
          >
            <span>All Categories</span>
          </button>
          
          {/* Other categories - Skeleton */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          ))}
        </div>
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
            {/* Featured Articles Section - Static Text */}
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
                </div>
                <Button 
                  className="hover:bg-[#eef2eb] bg-transparent text-[#3a6147]"
                  disabled
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <BlogGridSkeleton count={4} />
            </div>

            {/* Recent Articles Section - Static Text */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
                </div>
                <Button 
                  className="hover:bg-[#eef2eb] bg-transparent text-[#3a6147]"
                  disabled
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
