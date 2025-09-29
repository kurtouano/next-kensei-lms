import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Skeleton for admin blogs page - showing static elements
export function AdminBlogsSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Page Header - Static */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">Blog Management</h1>
            <p className="text-sm sm:text-base text-[#4a7c59]">Create and manage your blog posts</p>
          </div>
          <div className="flex justify-end">
            <Button className="bg-[#4a7c59] hover:bg-[#3a6147] text-sm w-full sm:w-auto" disabled>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Static Headers with Skeleton Values */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-6 animate-pulse"></div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-4 animate-pulse"></div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Static Elements */}
      <div className="mb-6 border border-gray-200 rounded-lg bg-white">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts by title, excerpt, or author..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                disabled
              >
                <option value="all">All Categories</option>
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Culture">Culture</option>
                <option value="Travel">Travel</option>
                <option value="Business">Business</option>
                <option value="Food">Food</option>
                <option value="Entertainment">Entertainment</option>
              </select>
              <select
                className="flex-1 sm:max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                disabled
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table - Static Header with Skeleton Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Blog Posts (<span className="h-4 bg-gray-200 rounded w-4 animate-pulse inline-block"></span> of <span className="h-4 bg-gray-200 rounded w-4 animate-pulse inline-block"></span> total)
          </CardTitle>
          <CardDescription>
            Manage your blog posts and their content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">Title</th>
                  <th className="pb-3 text-left font-medium">Author</th>
                  <th className="pb-3 text-left font-medium">Category</th>
                  <th className="pb-3 text-left font-medium">Read Time</th>
                  <th className="pb-3 text-left font-medium">Published</th>
                  <th className="pb-3 text-left font-medium">Views</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="max-w-xs">
                        <div className="h-5 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <span>•</span>
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <span>•</span>
                  <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
                  <span>•</span>
                  <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Generic admin page skeleton
export function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
