import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  Plus, 
  BarChart,
  Activity
} from "lucide-react"

// Skeleton for instructor dashboard - showing static elements
export function InstructorDashboardSkeleton() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Page Header - Static */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#2c3e2d] leading-tight break-words">
              Welcome back, <span className="h-6 bg-gray-200 rounded w-24 animate-pulse inline-block"></span>!
            </h1>
            <p className="text-[#4a7c59] text-xs sm:text-sm lg:text-base mt-1 break-words">Manage your courses and view analytics</p>
          </div>
          <Button
            className="bg-[#4a7c59] hover:bg-[#3a6147] w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex-shrink-0"
            disabled
          >
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
            Create New Course
          </Button>
        </div>

        {/* Tabs - Static */}
        <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4 lg:space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#eef2eb] h-9 sm:h-10 lg:h-auto rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all duration-200 truncate"
              disabled
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all duration-200 truncate"
              disabled
            >
              <span className="hidden sm:inline">My Courses (<span className="h-4 bg-gray-200 rounded w-4 animate-pulse inline-block"></span>)</span>
              <span className="sm:hidden">Courses (<span className="h-4 bg-gray-200 rounded w-4 animate-pulse inline-block"></span>)</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Static Elements */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 lg:space-y-6 w-full">
            {/* Stats Cards - Static Headers with Skeleton Values */}
            <div className="grid gap-2 sm:gap-3 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#2c3e2d] leading-tight truncate">Total Students</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] flex-shrink-0" />
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 break-words">
                    Across <span className="h-3 bg-gray-200 rounded w-4 animate-pulse inline-block"></span> course<span className="h-3 bg-gray-200 rounded w-4 animate-pulse inline-block"></span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#2c3e2d] leading-tight truncate">Total Courses</CardTitle>
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] flex-shrink-0" />
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="h-6 bg-gray-200 rounded w-8 animate-pulse mb-1"></div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 break-words">
                    Published courses
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#2c3e2d] leading-tight truncate">Total Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] flex-shrink-0" />
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse mb-1"></div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 break-words">
                    <span className="h-3 bg-gray-200 rounded w-8 animate-pulse inline-block"></span> lessons, <span className="h-3 bg-gray-200 rounded w-8 animate-pulse inline-block"></span> modules
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#2c3e2d] leading-tight truncate">Average Rating</CardTitle>
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] flex-shrink-0" />
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="h-6 bg-gray-200 rounded w-12 animate-pulse mb-1"></div>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 break-words">
                    From student reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity - Static Headers */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 w-full">
              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base text-[#2c3e2d] truncate">Course Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] sm:h-[280px] lg:h-[380px] px-3 sm:px-6 pb-4 sm:pb-6 flex flex-col">
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <BarChart className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse mx-auto mb-2 text-[#4a7c59]" />
                      <p className="text-xs sm:text-sm text-[#5c6d5e]">Preparing chart data...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="h-[200px] sm:h-[280px] lg:h-[380px] overflow-y-auto">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab - Static */}
          <TabsContent value="courses" className="w-full">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">My Courses</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your published courses</p>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="h-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
