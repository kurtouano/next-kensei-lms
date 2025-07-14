// CoursesPage.jsx - Fixed with working price filter, sort by, and proper empty state
"use client"

import { useState, useEffect, memo, useMemo } from "react"
import { BookOpen, AlertCircle, Search, X, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { CourseCard } from "./CourseCard"
import { InstructorCourseCard } from "./InstructorCourseCard"
import { useCourses } from "./useCoursesHook"

export default function CoursesPage() {
  const { data: session, status } = useSession()
  
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

  // Local state for search input and filters
  const [searchInput, setSearchInput] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  
  // 🔧 NEW: Additional filter states
  const [priceFilter, setPriceFilter] = useState("all") // "all", "free", "paid"
  const [sortBy, setSortBy] = useState("rating") // "rating", "newest", "popular"

  // Keep user profile logic as-is
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

  // 🔧 NEW: Apply additional filters to courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses]

    // Apply price filter
    if (priceFilter === "free") {
      filtered = filtered.filter(course => course.price === 0)
    } else if (priceFilter === "paid") {
      filtered = filtered.filter(course => course.price > 0)
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "popular":
        filtered.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
        break
      case "rating":
      default:
        filtered.sort((a, b) => {
          const aRating = a.ratingStats?.averageRating || a.averageRating || 0
          const bRating = b.ratingStats?.averageRating || b.averageRating || 0
          if (aRating !== bRating) {
            return bRating - aRating
          }
          return (b.enrolledStudents || 0) - (a.enrolledStudents || 0)
        })
        break
    }

    return filtered
  }, [courses, priceFilter, sortBy])

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (selectedCategory !== "all") count++
    if (priceFilter !== "all") count++
    if (sortBy !== "rating") count++
    setActiveFiltersCount(count)
  }, [selectedCategory, priceFilter, sortBy])

  const clearAllFilters = () => {
    setSearchInput("")
    handleClearSearch()
    handleCategoryChange("all")
    setPriceFilter("all")
    setSortBy("rating")
  }

  // Helper function to check if user is the instructor of a course
  const isInstructorOwnedCourse = (course) => {
    if (!session?.user) return false
    
    return course.instructor?.email === session.user.email || 
           course.instructor?.id === session.user.id ||
           course.instructorId === session.user.id
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
            <p className="text-[#5c6d5e]">Browse our comprehensive selection of Japanese language courses</p>
          </div>
          
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses by title, instructor, or level..."
              value={searchInput}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
            />
            {searchInput && (
              <button
                onClick={handleClearSearchClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 py-1 border-gray-300 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-[#4a7c59] text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">JLPT Level</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🔧 FIXED: Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free Courses</option>
                    <option value="paid">Paid Courses</option>
                  </select>
                </div>

                {/* 🔧 FIXED: Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {(activeFiltersCount > 0 || searchInput) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchInput && (
              <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                Search: "{searchInput}"
                <button onClick={handleClearSearchClick} className="hover:text-[#3a6147]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => handleCategoryChange("all")} className="hover:text-[#3a6147]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {priceFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                {priceFilter === "free" ? "Free Courses" : "Paid Courses"}
                <button onClick={() => setPriceFilter("all")} className="hover:text-[#3a6147]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== "rating" && (
              <span className="inline-flex items-center gap-1 bg-[#eef2eb] text-[#4a7c59] px-3 py-1 rounded-full text-sm">
                Sort: {sortBy === "newest" ? "Newest First" : "Most Popular"}
                <button onClick={() => setSortBy("rating")} className="hover:text-[#3a6147]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-6">
          Showing {filteredCourses.length} of {courseStats.total} courses
          {searchInput && ` for "${searchInput}"`}
        </div>
      </div>

      {/* Results Section */}
      <CourseGrid 
        courses={filteredCourses}
        courseStats={courseStats}
        selectedCategory={selectedCategory}
        pagination={pagination}
        onPageChange={handlePageChange}
        isInstructorOwnedCourse={isInstructorOwnedCourse}
        session={session}
      />
    </PageLayout>
  )
}

const PageLayout = memo(function PageLayout({ session, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
})

// 🔧 FIXED: Empty State with consistent height but centered message
const EmptyState = memo(function EmptyState({ selectedCategory, categoryName, searchQuery }) {
  const isSearchEmpty = searchQuery && searchQuery.trim()
  
  return (
    // Container with minimum height matching course grid
    <div className="min-h-[500px] flex justify-center mb-8">
      <div className="text-center py-12">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isSearchEmpty ? 'No courses found' : 'No courses found'}
        </h3>
        <p className="text-gray-600 mb-4">
          {isSearchEmpty 
            ? `No courses match "${searchQuery}". Try adjusting your search terms.`
            : selectedCategory === "all" 
              ? "No courses are currently available." 
              : `No courses found in the ${categoryName} category.`
          }
        </p>
      </div>
    </div>
  )
})

const ErrorDisplay = memo(function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-red-500 mb-2">Error loading courses</p>
        <p className="text-gray-600">{error}</p>
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
      {/* Page Title Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-80 animate-pulse mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Search and filter skeleton */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse mb-6"></div>
      </div>

      {/* Course Grid Skeleton */}
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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="aspect-[16/10] w-full bg-gray-200 animate-pulse"></div>
      <div className="p-6 space-y-4">
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
  onPageChange,
  isInstructorOwnedCourse,
  session
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {courses.map((course) => {
          const isOwned = isInstructorOwnedCourse(course)
          
          return isOwned ? (
            <InstructorCourseCard 
              key={course._id || course.id} 
              course={course} 
              isInstructorOwned={true}
            />
          ) : (
            <CourseCard 
              key={course._id || course.id} 
              course={course} 
            />
          )
        })}
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
      <div className="text-sm text-gray-600">
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
          className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1 mx-4">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={index} className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={
                  currentPage === page
                    ? "bg-[#4a7c59] text-white hover:bg-[#3a6147] border-[#4a7c59]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden mx-4 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )
})