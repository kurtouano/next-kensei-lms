// hooks/useCourses.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useApiWithRetry } from '@/hooks/useApiWithRetry'

const COURSES_PER_PAGE = 6

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("all") // "all", "free", "paid"
  const [sortBy, setSortBy] = useState("rating") // "rating", "newest", "popular"
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false) // Track if we've loaded courses at least once
  
  // Use enhanced API hook with retry logic
  const { loading, error, get, clearError, retryCount, isRetrying } = useApiWithRetry({
    maxRetries: 5,
    baseDelay: 1000,
    showLoadingMinTime: 800
  })

  // Categories
  const categories = useMemo(() => [
    { id: "all", name: "All Courses" },
    { id: "N5", name: "Beginner (N5)" },
    { id: "N4", name: "Elementary (N4)" },
    { id: "N3", name: "Intermediate (N3)" },
    { id: "N2", name: "Upper Intermediate (N2)" },
    { id: "N1", name: "Advanced (N1)" },
  ], [])

  // Debounced search to avoid excessive filtering
  const debouncedSearch = useDebouncedCallback((query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, 300)

  // Fetch courses with retry logic
  const fetchCourses = useCallback(async () => {
    try {
      const data = await get('/api/courses', {
        operationName: "Fetch Courses"
      })
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch courses')
      }
      
      let coursesArray = [];
      if (data.success && Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else if (Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else if (Array.isArray(data)) {
        coursesArray = data;
      } else {
        throw new Error('Invalid response format - expected courses array')
      }
      
      setCourses(coursesArray)
      setHasLoadedOnce(true) // Mark that we've successfully loaded courses
      clearError() // Clear any previous errors
      
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      setCourses([])
      // Error state is handled by the useApiWithRetry hook
    }
  }, [get, clearError])

  // Filter and sort courses with fuzzy search capabilities
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = selectedCategory === "all" 
      ? courses.filter(course => course.isPublished !== false)
      : courses.filter((course) => {
          const matchesLevel = course.level === selectedCategory
          const matchesCategory = course.category === selectedCategory
          const isPublished = course.isPublished !== false
          
          return (matchesLevel || matchesCategory) && isPublished
        })

    // Apply price filter
    if (priceFilter === "free") {
      filtered = filtered.filter(course => course.price === 0)
    } else if (priceFilter === "paid") {
      filtered = filtered.filter(course => course.price > 0)
    }

    // Apply search filter with fuzzy matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((course) => {
        const titleMatch = course.title?.toLowerCase().includes(query)
        const descriptionMatch = course.description?.toLowerCase().includes(query) || 
                                course.shortDescription?.toLowerCase().includes(query)
        const levelMatch = course.level?.toLowerCase().includes(query)
        const categoryMatch = course.category?.toLowerCase().includes(query)
        
        // Add fuzzy matching for common search terms
        const keywords = query.split(' ')
        const keywordMatch = keywords.some(keyword => 
          course.title?.toLowerCase().includes(keyword) ||
          course.description?.toLowerCase().includes(keyword) ||
          course.shortDescription?.toLowerCase().includes(keyword)
        )
        
        return titleMatch || descriptionMatch || levelMatch || categoryMatch || keywordMatch
      })
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      // If searching, prioritize title matches
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const aTitleMatch = a.title?.toLowerCase().includes(query)
        const bTitleMatch = b.title?.toLowerCase().includes(query)
        
        if (aTitleMatch && !bTitleMatch) return -1
        if (!aTitleMatch && bTitleMatch) return 1
      }
      
      // Apply the selected sorting method
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case "popular":
          return (b.enrolledStudents || 0) - (a.enrolledStudents || 0)
        case "rating":
        default:
          const aRating = a.ratingStats?.averageRating || a.averageRating || 0
          const bRating = b.ratingStats?.averageRating || b.averageRating || 0
          
          if (aRating !== bRating) {
            return bRating - aRating
          }
          
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })
  }, [courses, selectedCategory, searchQuery, priceFilter, sortBy])

  // Pagination calculations
  const paginationData = useMemo(() => {
    const totalCourses = filteredAndSortedCourses.length
    const totalPages = Math.ceil(totalCourses / COURSES_PER_PAGE)
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE
    const endIndex = startIndex + COURSES_PER_PAGE
    const paginatedCourses = filteredAndSortedCourses.slice(startIndex, endIndex)
    
    return {
      courses: paginatedCourses,
      currentPage,
      totalPages,
      totalCourses,
      coursesPerPage: COURSES_PER_PAGE,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCourses),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }, [filteredAndSortedCourses, currentPage])

  // Course stats
  const courseStats = useMemo(() => ({
    total: courses.length,
    filtered: filteredAndSortedCourses.length,
    showing: paginationData.courses.length,
    selectedCategoryName: categories.find(c => c.id === selectedCategory)?.name,
    searchQuery: searchQuery.trim(),
    pagination: {
      current: paginationData.currentPage,
      total: paginationData.totalPages,
      startIndex: paginationData.startIndex,
      endIndex: paginationData.endIndex
    }
  }), [courses.length, filteredAndSortedCourses.length, paginationData, categories, selectedCategory, searchQuery])

  // Handlers
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((query) => {
    debouncedSearch(query)
  }, [debouncedSearch])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setCurrentPage(1)
    // Cancel any pending debounced search
    debouncedSearch.cancel()
  }, [debouncedSearch])

  const handlePriceFilterChange = useCallback((filter) => {
    setPriceFilter(filter)
    setCurrentPage(1)
  }, [])

  const handleSortByChange = useCallback((sort) => {
    setSortBy(sort)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      handlePageChange(currentPage + 1)
    }
  }, [paginationData.hasNextPage, currentPage, handlePageChange])

  const handlePrevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      handlePageChange(currentPage - 1)
    }
  }, [paginationData.hasPrevPage, currentPage, handlePageChange])

  const handleRetry = useCallback(() => {
    fetchCourses()
  }, [fetchCourses])

  // Fetch on mount
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    // Data
    courses: paginationData.courses,
    loading,
    error,
    retryCount,
    isRetrying,
    hasLoadedOnce, // Track if courses have been loaded at least once
    
    // Category stuff
    selectedCategory,
    categories,
    courseStats,
    
    // Search
    searchQuery,
    
    // Additional filters
    priceFilter,
    sortBy,
    
    // Pagination
    pagination: {
      currentPage: paginationData.currentPage,
      totalPages: paginationData.totalPages,
      hasNextPage: paginationData.hasNextPage,
      hasPrevPage: paginationData.hasPrevPage,
      totalCourses: paginationData.totalCourses
    },
    
    // Actions
    handleCategoryChange,
    handleSearchChange,
    handleClearSearch,
    handlePriceFilterChange,
    handleSortByChange,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handleRetry: fetchCourses  // Use fetchCourses as the retry function
  }
}