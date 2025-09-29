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
import { MyLearningSkeleton } from '@/components/MyLearningSkeleton'
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

  if (loading) return <MyLearningSkeleton />;
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
  const isInProgress = title === "In Progress";
  
  return (
    <div className={`mb-12 ${isCompleted || isInProgress ? 'mt-8 pt-8 border-t border-gray-100' : ''}`}>
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
