import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  ThumbsUp, 
  Share2, 
  Star,
  MessageCircle,
  Clock,
  BookIcon,
  User,
  Calendar,
  PlayCircle,
  FileText,
  BookOpen,
  Award,
  List
} from "lucide-react"

// Skeleton for course page - showing static elements
export function CoursePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {/* Mobile Lessons Button */}
              <div className="lg:hidden mb-4 flex justify-end">
                <div className="bg-white border-2 border-[#4a7c59] text-[#4a7c59] rounded-full shadow-md h-10 px-4 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="text-sm font-semibold">Lessons</span>
                </div>
              </div>

              {/* Video Player Skeleton */}
              <div className="mb-8">
                <div className="aspect-video w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Course Info Card - Static Elements */}
              <div className="mb-6 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
                {/* Course Title - Skeleton */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

                {/* Course Progress - Static Label */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2c3e2d] whitespace-nowrap">Course Progress:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                </div>

                {/* Course Stats - Static Icons with Skeleton Values */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#5c6d5e] mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookIcon className="h-4 w-4" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>

                {/* About Section - Static Header */}
                <div className="mb-6">
                  <h3 className="font-medium text-[#2c3e2d] mb-2">About This Course</h3>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>

                {/* Action Buttons - Static */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] hover:text-[#4a7c59] hover:border-[#4a7c59]" disabled>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Like
                  </Button>
                  <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] hover:text-[#4a7c59] hover:border-[#4a7c59]" disabled>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Tab Navigation - Static */}
                <div className="border-b border-[#dce4d7]">
                  <div className="flex gap-6">
                    <button className="py-3 px-1 text-sm font-medium border-b-2 border-[#4a7c59] text-[#4a7c59]" disabled>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Reviews & Ratings
                      </div>
                    </button>
                    <button className="py-3 px-1 text-sm font-medium border-b-2 border-transparent text-[#5c6d5e]" disabled>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Ask a Question
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab Content Skeleton */}
                <div className="mt-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar - Static Elements */}
            <div className="hidden lg:block mt-4 w-full lg:mt-0 lg:w-1/3 lg:pl-4">
              <div className="sticky top-4 rounded-lg border border-[#dce4d7] bg-white shadow-sm">
                {/* Sidebar Header - Static */}
                <div className="border-b border-[#dce4d7] bg-[#eef2eb] p-4">
                  <h2 className="font-semibold text-[#2c3e2d]">Course Content</h2>
                  <p className="text-sm text-[#5c6d5e]">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </p>
                </div>

                {/* Course Modules Skeleton */}
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, moduleIndex) => (
                    <div key={moduleIndex} className="border border-gray-100 rounded-lg bg-white">
                      {/* Module Header */}
                      <div className="p-3 bg-gray-50 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Module Items */}
                      <div className="space-y-1">
                        {Array.from({ length: moduleIndex === 0 ? 4 : moduleIndex === 1 ? 3 : 2 }).map((_, itemIndex) => (
                          <div key={itemIndex} className="flex w-full items-center rounded-md p-2 text-left text-sm">
                            <div className="mr-3 flex-shrink-0">
                              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>
                            <div className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gray-300">
                              <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Certificate Section - Static */}
                <div className="p-4 bg-[#eef2eb]">
                  <div className="text-center mb-2">
                    <Award className="h-6 w-6 text-[#4a7c59] mx-auto mb-2" />
                    <span className="text-sm font-bold text-[#2c3e2d]">Course Certificate</span>
                  </div>
                  <div className="text-xs text-[#5c6d5e] mb-3 text-center">
                    Complete all modules and pass all quizzes to get your certificate
                  </div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
