// app/my-learning/page.jsx
"use client"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import         { BookOpen, Clock, Search, Loader2, Award, CheckCircle } from "lucide-react"
import { useMyLearning } from './useMyLearningHook'
import { CourseCard } from './CourseCard'
import { useMemo } from "react"

export default function MyLearning() {
  const { user, enrolledCourses, loading, error, refetch } = useMyLearning();

  const { inProgressCourses, completedCourses } = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return { inProgressCourses: [], completedCourses: [] };
    }

    const inProgress = enrolledCourses.filter(course => course.progress < 100);
    const completed = enrolledCourses.filter(course => course.progress >= 100);

    return { inProgressCourses: inProgress, completedCourses: completed };
  }, [enrolledCourses]);

  const hasAnyCourses = useMemo(() => {
    return enrolledCourses && enrolledCourses.length > 0;
  }, [enrolledCourses]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <WelcomeHeader userName={user?.name} />
          
          {!hasAnyCourses ? (
            <EmptyState />
          ) : (
            <>
              {inProgressCourses.length > 0 && (
                <CourseGrid 
                  courses={inProgressCourses} 
                  totalCourses={inProgressCourses.length}
                  title="In Progress"
                  icon={<Clock className="h-5 w-5 text-gray-600" />}
                />
              )}
              
              {completedCourses.length > 0 && (
                <CourseGrid 
                  courses={completedCourses} 
                  totalCourses={completedCourses.length}
                  title="Completed"
                  icon={<CheckCircle className="h-5 w-5 text-gray-600" />}
                />
              )}
              
              <QuickActions />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// SUB COMPONENTS
function WelcomeHeader({ userName }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl mb-2 font-bold text-gray-900">
        Welcome back, {userName || 'Student'}!
      </h1>
      <p className="text-gray-600">Continue your Japanese learning journey</p>
    </div>
  );
}

function CourseGrid({ courses, totalCourses, title, icon }) {
  const isCompleted = title === "Completed";
  
  return (
    <div className={`mb-12 ${isCompleted ? 'mt-8 pt-8 border-t border-gray-100' : ''}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  return (
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
          <Link href="/profile?tab=certifications">
            <Award className="mr-2 h-4 w-4" />
            View Certificates
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
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
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <main className="flex-1 py-8 ">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Failed to load courses</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Button 
              onClick={onRetry} 
              className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
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
    </div>
  );
}