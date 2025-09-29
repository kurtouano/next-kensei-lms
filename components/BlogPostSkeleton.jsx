import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  User
} from "lucide-react"

// Skeleton for blog post page - showing static elements
export function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button - Static */}
          <div className="mb-6">
            <div className="inline-flex items-center text-[#4a7c59]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </div>
          </div>

          {/* Article Header - Static Elements */}
          <div className="mb-8">
            {/* Category Badge - Skeleton */}
            <div className="mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            </div>
            
            {/* Title - Skeleton */}
            <div className="h-12 bg-gray-200 rounded w-4/5 mb-6 animate-pulse"></div>

            {/* Article Meta - Static Icons with Skeleton Values */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-6">
              {/* Featured Image - Skeleton */}
              <div className="mb-8">
                <div className="w-full h-64 lg:h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Article Content - Skeleton */}
              <Card className="border-0 shadow-sm mb-8">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags - Static Header with Skeleton Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse"></div>
                </div>
              </div>

              {/* Social Actions - Static */}
              <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm mb-8">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-600" disabled>
                    <Heart className="h-5 w-5" />
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-600" disabled>
                    <Share2 className="h-5 w-5" />
                    Share
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* Author Card - Static */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Related Posts - Static */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Newsletter Signup - Static */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Stay Updated with Japanese Learning</h3>
                    <p className="text-sm text-gray-600 mb-4">Get notified when we publish new blog posts about Japanese language, culture, and learning tips.</p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
