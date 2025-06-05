// Fixed MyLearning component with consistent card heights

"use client"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Search, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function MyLearning() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return; // Still loading session

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchMyLearning();
  }, [session, status, router]);

  const fetchMyLearning = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/my-learning');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEnrolledCourses(data.enrolledCourses);
      } else {
        setError(data.error || 'Failed to fetch learning data');
      }
    } catch (error) {
      console.error('Error fetching my learning:', error);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Animate for Loading
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header isLoggedIn={true} />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-gray-200 shadow-sm">
                    <div className="aspect-video w-full h-full bg-gray-200 animate-pulse"></div>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-6 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header isLoggedIn={true} />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">Failed to load courses</h2>
                <p className="text-gray-600">{error}</p>
              </div>
              <Button 
                onClick={fetchMyLearning} 
                className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl mb-2 font-bold text-gray-900">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-gray-600">Continue your Japanese learning journey</p>
          </div>

          {/* Empty State */}
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Button 
                asChild 
                className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              >
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            /* In Progress Courses */
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">In Progress</h2>
                <span className="text-sm text-gray-500">
                  {user?.totalCourses || 0} course{user?.totalCourses !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md flex flex-col h-full"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <CardContent className="p-4 flex flex-col flex-grow">
                      {/* Top content section - will expand to fill available space */}
                      <div className="flex-grow">
                        <h3 className="mb-1 text-lg font-medium text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="mb-3 text-sm text-gray-500">
                          Instructor: {course.instructor}
                        </p>
                      </div>

                      {/* Bottom section - always at the bottom */}
                      <div className="flex-shrink-0">
                        <div className="mb-3">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {course.completedLessons}/{course.totalLessons} lessons
                            </span>
                            <span className="font-medium text-[#4a7c59]">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            className="h-2 bg-gray-100" 
                            indicatorClassName="bg-[#4a7c59]" 
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>Last: {course.lastLesson}</span>
                          </div>
                          <Button 
                            className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" 
                            size="sm" 
                            asChild
                          >
                            <Link href={`/courses/${course.slug}`}>
                              Continue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {enrolledCourses.length > 0 && (
            <div className="bg-[#eef2eb] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white"
                  asChild
                >
                  <Link href="/courses">
                    <Search className="mr-2 h-4 w-4" />
                    Browse More Courses
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white"
                  asChild
                >
                  <Link href="/profile">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Progress
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}