"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, Users, BookOpen, DollarSign, Star, Plus, Loader2 } from "lucide-react"
import { Header } from "@/components/header"

export default function AdminDashboard() {
  // ✅ State for real data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  // ✅ Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // ✅ Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#4a7c59]" />
            <span className="ml-2 text-[#4a7c59]">Loading dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-[#4a7c59] hover:bg-[#3a6147]"
            >
              Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ✅ No courses state (only applies to the entire dashboard, not the tab)
  if (dashboardData?.courses?.length === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50 mb-4" />
            <h2 className="text-2xl font-bold text-[#2c3e2d] mb-2">No Courses Yet</h2>
            <p className="text-[#4a7c59] mb-6">Start by creating your first course</p>
            <Button
              className="bg-[#4a7c59] hover:bg-[#3a6147]"
              onClick={() => (window.location.href = "/instructor/create-course")}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Your First Course
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ✅ Extract data for easier use
  const { user, courses, stats } = dashboardData;

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">
              Welcome back, {user.name}!
            </h1>
            <p className="text-[#4a7c59] text-sm sm:text-base">Manage your courses and view analytics</p>
          </div>
          <Button
            className="bg-[#4a7c59] hover:bg-[#3a6147] w-full sm:w-auto"
            onClick={() => (window.location.href = "/instructor/create-course")}
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

          {/* Overview Tab - Keep 4 cards but remove data from Course Performance and Recent Activity */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats.totalCourses} course{stats.totalCourses !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedCourses} published, {stats.draftCourses} draft{stats.draftCourses !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalLessons} lessons, {stats.totalModules} modules
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">
                    From student reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ✅ REPLACED: Remove course data, bring back chart icons */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Course Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] sm:h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[#4a7c59] opacity-50" />
                    <p className="mt-2 text-xs sm:text-sm">Course performance chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] sm:h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[#4a7c59] opacity-50" />
                    <p className="mt-2 text-xs sm:text-sm">Recent activity chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab - Real Data with No Courses State */}
          <TabsContent value="courses">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">My Courses</CardTitle>
                <CardDescription className="text-sm">Manage your published courses</CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                {/* Check if there are no courses */}
                {(!courses || courses.length === 0) ? (
                  <div className="text-center py-12 px-4">
                    <BookOpen className="mx-auto h-16 w-16 text-[#4a7c59] opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold text-[#2c3e2d] mb-2">No Courses Found</h3>
                    <p className="text-[#4a7c59] mb-6 max-w-md mx-auto">
                      You haven't created any courses yet. Start building your first course to share your knowledge with students.
                    </p>
                    <Button
                      className="bg-[#4a7c59] hover:bg-[#3a6147]"
                      onClick={() => (window.location.href = "/instructor/create-course")}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4 px-4">
                      {courses.map((course) => (
                        <Card key={course.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3 mb-3">
                              {course.thumbnail && (
                                <img 
                                  src={course.thumbnail} 
                                  alt={course.title}
                                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm leading-tight mb-1">{course.title}</div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Published {formatDate(course.published)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {course.modulesCount} modules • {course.lessonsCount} lessons
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Students:</span>
                                <div className="font-medium">{course.students.toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Revenue:</span>
                                <div className="font-medium">{formatCurrency(course.revenue)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rating:</span>
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">{course.rating || '0.0'}</span>
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({course.ratingCount || 0})
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <div>
                                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                    course.status === 'Published' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {course.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => window.location.href = `/instructor/courses/${course.id}/edit`}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => window.location.href = `/courses/${course.id}`}
                              >
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="pb-3 text-left font-medium">Course</th>
                            <th className="pb-3 text-left font-medium">Students</th>
                            <th className="pb-3 text-left font-medium">Revenue</th>
                            <th className="pb-3 text-left font-medium">Rating</th>
                            <th className="pb-3 text-left font-medium">Status</th>
                            <th className="pb-3 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((course) => (
                            <tr key={course.id} className="border-b">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  {course.thumbnail && (
                                    <img 
                                      src={course.thumbnail} 
                                      alt={course.title}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{course.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Published {formatDate(course.published)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {course.modulesCount} modules • {course.lessonsCount} lessons
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">{course.students.toLocaleString()}</td>
                              <td className="py-4">{formatCurrency(course.revenue)}</td>
                              <td className="py-4">
                                <div className="flex items-center space-x-1">
                                  <span>{course.rating || '0'}</span>
                                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-xs text-muted-foreground">
                                    ({course.ratingCount || 0})
                                  </span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                  course.status === 'Published' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {course.status}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.location.href = `/instructor/courses/${course.id}/edit`}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.location.href = `/courses/${course.id}`}
                                  >
                                    View
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}