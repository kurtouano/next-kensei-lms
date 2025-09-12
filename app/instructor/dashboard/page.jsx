"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, Users, BookOpen, DollarSign, Star, Plus, Loader2, UserPlus, Trophy, CheckCircle, Activity, Heart, User, MessageCircle } from "lucide-react"
import dynamic from 'next/dynamic'
// Lazy load the Header component to reduce initial bundle size
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  loading: () => (
    <header className="sticky top-0 z-50 border-b border-[#dce4d7] bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="h-8 w-28 bg-gray-200 animate-pulse rounded"></div>
        <div className="hidden md:flex items-center gap-6">
          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    </header>
  ),
  ssr: false
})
import { useRouter } from "next/navigation"
// Lazy load the BonsaiSVG component to reduce initial bundle size
const BonsaiSVG = dynamic(() => import("@/components/bonsai-icon").then(mod => ({ default: mod.BonsaiSVG })), {
  loading: () => (
    <div className="w-8 h-8 rounded-full border border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center">
      <div className="w-4 h-4 bg-[#4a7c59] rounded-full animate-pulse"></div>
    </div>
  ),
  ssr: false
})

// Lazy load the heavy chart component to improve initial page load
const CoursePerformanceChart = dynamic(() => import("./components/course-performance-chart").then(mod => ({ default: mod.CoursePerformanceChart })), {
  loading: () => (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <BarChart className="h-8 w-8 animate-pulse mx-auto mb-2 text-[#4a7c59]" />
        <p className="text-sm text-[#5c6d5e]">Loading chart...</p>
      </div>
    </div>
  ),
  ssr: false // Charts don't need SSR
})

// Lazy load the recent activity section to reduce initial bundle size
const RecentActivitySection = dynamic(() => import("./components/recent-activity-section").then(mod => ({ default: mod.RecentActivitySection })), {
  loading: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
        <Loader2 className="h-4 w-4 animate-spin text-[#4a7c59]" />
      </CardHeader>
      <CardContent className="h-[200px] sm:h-[350px] overflow-y-auto">
        <div className="flex items-center justify-center h-full text-center text-muted-foreground">
          <div>
            <Activity className="mx-auto h-8 w-8 text-[#4a7c59] opacity-50 mb-2" />
            <p className="text-xs sm:text-sm">Loading recent activity...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false
})

// Lazy load the courses section to reduce initial bundle size
const CoursesSection = dynamic(() => import("./components/courses-section").then(mod => ({ default: mod.CoursesSection })), {
  loading: () => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">My Courses</CardTitle>
        <CardDescription className="text-sm">Manage your published courses</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <BookOpen className="mx-auto h-8 w-8 text-[#4a7c59] opacity-50 mb-2" />
            <p className="text-sm text-[#5c6d5e]">Loading courses...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false
})

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Progressive loading states
  const [basicDataLoaded, setBasicDataLoaded] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  
  // NEW: Pagination state for activities
  const [activityOffset, setActivityOffset] = useState(0);
  const [loadingMoreActivity, setLoadingMoreActivity] = useState(false);
  
  const router = useRouter();

  // UPDATED: Enhanced fetchRecentActivity with pagination support
  const fetchRecentActivity = async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMoreActivity(true);
      } else {
        setActivityLoading(true);
      }
      
      const res = await fetch(`/api/instructor/recent-activity?limit=5&offset=${offset}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (append) {
            // Append new activities to existing ones
            setRecentActivity(prevActivity => ({
              ...data.data,
              activities: [...(prevActivity?.activities || []), ...data.data.activities]
            }));
          } else {
            // Replace activities (initial load)
            setRecentActivity(data.data);
          }
          setActivityOffset(offset);
        }
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      // Don't set error state for activity, just log it
    } finally {
      if (append) {
        setLoadingMoreActivity(false);
      } else {
        setActivityLoading(false);
      }
    }
  };

  // NEW: Function to load more activities
  const handleLoadMoreActivity = () => {
    const newOffset = activityOffset + 5; // Load next 5 activities
    fetchRecentActivity(newOffset, true); // true = append to existing
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/instructor/dashboard");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Dashboard data:', data);
        
        if (data.success) {
          setDashboardData(data.data);
          setBasicDataLoaded(true);
          
          // Show charts immediately after basic data is loaded
          // The chart component itself handles its own loading state
          setShowCharts(true);
        } else {
          setError(data.error || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Load activity data in parallel but don't block the main UI
    setTimeout(() => {
      fetchRecentActivity(0, false);
    }, 50);
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };


  // Show minimal loading only if we have no data at all
  if (loading && !dashboardData) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#4a7c59]" />
            <span className="ml-2 text-[#4a7c59]">Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => router.refresh()} 
              className="mt-4 bg-[#4a7c59] hover:bg-[#3a6147]"
            >
              Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Extract data for easier use
  const { user, courses, stats } = dashboardData || {};

  return (
    <>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">
              Welcome back, {user?.name || 'Instructor'}!
            </h1>
            <p className="text-[#4a7c59] text-sm sm:text-base">Manage your courses and view analytics</p>
          </div>
          <Button
            className="bg-[#4a7c59] hover:bg-[#3a6147] w-full sm:w-auto"
            onClick={() => router.push("/instructor/create-course")}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-[#eef2eb] h-10 sm:h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm">
              <span className="hidden sm:inline">My Courses ({courses?.length || 0})</span>
              <span className="sm:hidden">Courses ({courses?.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.totalStudents?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats?.totalCourses || 0} course{(stats?.totalCourses || 0) !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.totalCourses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                     Published courses
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalLessons || 0} lessons, {stats?.totalModules || 0} modules
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats?.averageRating || '0.0'}</div>
                  <p className="text-xs text-muted-foreground">
                    From student reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Course Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] sm:h-[350px]">
                  {showCharts ? (
                    <CoursePerformanceChart 
                      courses={courses} 
                      stats={stats}
                      monthlyData={dashboardData?.monthlyData || []}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center">
                        <BarChart className="h-8 w-8 animate-pulse mx-auto mb-2 text-[#4a7c59]" />
                        <p className="text-sm text-[#5c6d5e]">Preparing chart data...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <RecentActivitySection 
                recentActivity={recentActivity}
                activityLoading={activityLoading}
                loadingMoreActivity={loadingMoreActivity}
                handleLoadMoreActivity={handleLoadMoreActivity}
              />
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CoursesSection 
              courses={courses}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}