// CoursesPage.jsx - Super clean with just one hook!
"use client"

import { useState, useEffect, memo } from "react"
import { BookOpen, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useSession } from "next-auth/react"
import { CourseCard } from "./CourseCard"
import { useCourses } from "./useCoursesHook"

export default function CoursesPage() {
  const { data: session, status } = useSession()
  
  // One hook handles all course logic
  const {
    courses,
    loading,
    error,
    selectedCategory,
    categories,
    courseStats,
    handleCategoryChange,
    handleRetry
  } = useCourses()

  // Keep user profile logic as-is (simple enough)
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        if (!data.success) {
          console.error('Failed to fetch user:', data.message)
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      }
    }

    if (status !== "loading") {
      fetchUserDetails()
    }
  }, [status])

  if (loading) {
    return (
      <PageLayout session={session}>
        <LoadingSkeleton />
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout session={session}>
        <ErrorDisplay error={error} onRetry={handleRetry} />
      </PageLayout>
    )
  }

  return (
    <PageLayout session={session}>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Course Catalog</h1>
        <p className="text-[#5c6d5e]">
          Browse our comprehensive selection of Japanese language courses
        </p>
        <div className="mt-2 text-sm text-[#5c6d5e]">
          {courseStats.total} course{courseStats.total !== 1 ? 's' : ''} available
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <CategoryTabs 
          categories={categories} 
          onCategoryChange={handleCategoryChange}
        />

        <TabsContent value={selectedCategory} className="mt-0">
          <CourseGrid 
            courses={courses}
            courseStats={courseStats}
            selectedCategory={selectedCategory}
            onShowAll={() => handleCategoryChange("all")}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}

const PageLayout = memo(function PageLayout({ session, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={!!session?.user} />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
})

const EmptyState = memo(function EmptyState({ selectedCategory, categoryName, onShowAll }) {
  return (
    <div className="text-center py-12">
      <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e]" />
      <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">
        No courses found
      </h3>
      <p className="text-[#5c6d5e]">
        {selectedCategory === "all" 
          ? "No courses are currently available." 
          : `No courses found in the ${categoryName} category.`
        }
      </p>
      {selectedCategory !== "all" && (
        <button 
          onClick={onShowAll}
          className="mt-4 px-4 py-2 bg-[#4a7c59] text-white rounded-md hover:bg-[#3a6147]"
        >
          View All Courses
        </button>
      )}
    </div>
  )
})

const ErrorDisplay = memo(function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-red-500 mb-2">Error loading courses</p>
        <p className="text-[#5c6d5e]">{error}</p>
        <button 
          onClick={onRetry} 
          className="mt-4 px-4 py-2 bg-[#4a7c59] text-white rounded-md hover:bg-[#3a6147]"
        >
          Try Again
        </button>
      </div>
    </div>
  )
})

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <CategorySkeleton />

      <div className="mb-4 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <CourseSkeleton key={i} />
        ))}
      </div>
    </>
  )
})

const CategorySkeleton = memo(function CategorySkeleton() {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      
      <div className="hidden gap-3 sm:flex justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
})

const CourseSkeleton = memo(function CourseSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
      <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
        <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
})

const CategoryTabs = memo(function CategoryTabs({ categories, onCategoryChange }) {
  return (
    <TabsList className="mb-6 w-full bg-transparent p-0 justify-around">
      <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="border border-[#dce4d7] bg-white data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white hover:bg-[#eef2eb] transition-colors text-xs px-2 py-2"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </div>
      
      <div className="hidden gap-3 sm:flex sm:flex-wrap sm:justify-start">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="border border-[#dce4d7] bg-white data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white hover:bg-[#eef2eb] transition-colors whitespace-nowrap"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </div>
    </TabsList>
  )
})

const CourseGrid = memo(function CourseGrid({ courses, courseStats, selectedCategory, onShowAll }) {
  if (courses.length === 0) {
    return (
      <EmptyState 
        selectedCategory={selectedCategory}
        categoryName={courseStats.selectedCategoryName}
        onShowAll={onShowAll}
      />
    )
  }

  return (
    <>
      <CourseGridInfo courseStats={courseStats} selectedCategory={selectedCategory} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course._id || course.id} course={course} />
        ))}
      </div>
    </>
  )
})

const CourseGridInfo = memo(function CourseGridInfo({ courseStats, selectedCategory }) {
  return (
    <div className="mb-4 space-y-2 mt-6 lg:mt-0">
      <div className="flex flex-row justify-between space-y-1 sm:space-y-0 sm:flex-row items-center">
        <div className="text-xs text-[#5c6d5e]">
          <span className="flex sm:inline">
            Showing {courseStats.filtered} course{courseStats.filtered !== 1 ? 's' : ''}
          </span>
          {selectedCategory !== "all" && (
            <span className="block sm:inline sm:ml-1">
              in {courseStats.selectedCategoryName}
            </span>
          )}
        </div>
        <div className="text-xs text-[#5c6d5e] sm:text-right">
          Sorted by rating and date
        </div>
      </div>
    </div>
  )
})