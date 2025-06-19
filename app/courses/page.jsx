// CoursesPage.jsx - With Inline Search & Filters
"use client"

import { useState, useEffect, memo } from "react"
import { BookOpen, AlertCircle, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useSession } from "next-auth/react"
import { CourseCard } from "./CourseCard"
import { useCourses } from "./useCoursesHook"

export default function CoursesPage() {
  const { data: session, status } = useSession()
  
  // One hook handles all course logic including pagination
  const {
    courses,
    loading,
    error,
    selectedCategory,
    categories,
    courseStats,
    searchQuery,
    pagination,
    handleCategoryChange,
    handleSearchChange,
    handleClearSearch,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handleRetry
  } = useCourses()

  // Local state for search input (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState("")

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

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    handleSearchChange(value)
  }

  const handleClearSearchClick = () => {
    setSearchInput("")
    handleClearSearch()
  }

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
          Discover and enroll in professional Japanese language courses
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5c6d5e] h-4 w-4" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="pl-10 pr-10 py-2 w-full border-[#dce4d7] bg-white focus:border-[#4a7c59] focus:ring-[#4a7c59] rounded-lg text-[#2c3e2d] placeholder:text-[#5c6d5e] h-10"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearchClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-5 w-5 hover:bg-[#eef2eb] rounded-full"
              >
                <X className="h-3 w-3 text-[#5c6d5e]" />
              </Button>
            )}
          </div>

          {/* Level Filter */}
          <div className="w-full sm:w-[230px]">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full h-10 border-[#dce4d7] bg-white text-[#2c3e2d] hover:bg-[#f8f9fa]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="hover:bg-[#eef2eb] min-w-48 pl-3 mt-1 cursor-pointer data-[highlighted]:bg-[#eef2eb] data-[state=checked]:bg-[#4a7c59] data-[state=checked]:text-white"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* horizontal line */}
        <div className="mt-5 pt-4 border-t border-[#dce4d7]"></div>
      </div>

      {/* Results Section */}
      <CourseGrid 
        courses={courses}
        courseStats={courseStats}
        selectedCategory={selectedCategory}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  )
}

const PageLayout = memo(function PageLayout({ session, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
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

const EmptyState = memo(function EmptyState({ selectedCategory, categoryName, searchQuery }) {
  const isSearchEmpty = searchQuery && searchQuery.trim()
  
  return (
    <div className="text-center py-12">
      <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e]" />
      <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">
        {isSearchEmpty ? 'No courses found' : 'No courses found'}
      </h3>
      <p className="text-[#5c6d5e] mb-4">
        {isSearchEmpty 
          ? `No courses match "${searchQuery}". Try adjusting your search terms.`
          : selectedCategory === "all" 
            ? "No courses are currently available." 
            : `No courses found in the ${categoryName} category.`
        }
      </p>
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
        <Button 
          onClick={onRetry} 
          className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]"
        >
          Try Again
        </Button>
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
      </div>

      {/* Search and filter skeleton */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="w-full sm:max-w-md h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full sm:w-[200px] h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Always visible line skeleton */}
        <div className="mt-4 pt-4 border-t border-[#dce4d7]"></div>
      </div>

      <div className="mb-4 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CourseSkeleton key={i} />
        ))}
      </div>
    </>
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

const CourseGrid = memo(function CourseGrid({ 
  courses, 
  courseStats, 
  selectedCategory, 
  pagination,
  onPageChange
}) {
  if (courses.length === 0) {
    return (
      <EmptyState 
        selectedCategory={selectedCategory}
        categoryName={courseStats.selectedCategoryName}
        searchQuery={courseStats.searchQuery}
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

      {/* Modern Pagination */}
      {pagination.totalPages > 1 && (
        <ModernPagination
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
})

const CourseGridInfo = memo(function CourseGridInfo({ courseStats, selectedCategory }) {
  return (
    <div className="mb-4 space-y-2 mt-6 lg:mt-0">
      <div className="flex flex-row justify-between space-y-1 sm:space-y-0 sm:flex-row items-center">
        <div className="text-xs text-[#5c6d5e]">
          <span className="flex sm:inline">
            {courseStats.searchQuery ? (
              <>Showing {courseStats.pagination.startIndex}-{courseStats.pagination.endIndex} of {courseStats.filtered} result{courseStats.filtered !== 1 ? 's' : ''}</>
            ) : (
              <>Showing {courseStats.pagination.startIndex}-{courseStats.pagination.endIndex} of {courseStats.filtered} course{courseStats.filtered !== 1 ? 's' : ''}</>
            )}
          </span>
          {selectedCategory !== "all" && !courseStats.searchQuery && (
            <span className="block sm:inline sm:ml-1">
              in {courseStats.selectedCategoryName}
            </span>
          )}
        </div>
        <div className="text-xs text-[#5c6d5e] sm:text-right">
          {courseStats.searchQuery ? 'Sorted by relevance' : 'Sorted by rating and date'}
        </div>
      </div>
    </div>
  )
})

const ModernPagination = memo(function ModernPagination({ pagination, onPageChange }) {
  const { currentPage, totalPages } = pagination

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      {/* Page Info */}
      <div className="text-sm text-[#5c6d5e]">
        Page {currentPage} of {totalPages}
      </div>

      {/* Modern Pagination Buttons */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="border-[#dce4d7] text-[#2c3e2d] hover:bg-[#eef2eb] disabled:opacity-50"
        >
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1 mx-4">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={index} className="px-2 py-1 text-[#5c6d5e]">...</span>
            ) : (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={
                  currentPage === page
                    ? "bg-[#4a7c59] text-white hover:bg-[#3a6147] border-[#4a7c59]"
                    : "border-[#dce4d7] text-[#2c3e2d] hover:bg-[#eef2eb]"
                }
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden mx-4 px-3 py-1 bg-[#eef2eb] rounded-md text-sm text-[#2c3e2d]">
          {currentPage} / {totalPages}
        </div>

        {/* Next */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="border-[#dce4d7] text-[#2c3e2d] hover:bg-[#eef2eb] disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
})