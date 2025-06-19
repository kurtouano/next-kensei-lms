// hooks/useCourses.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

const COURSES_PER_PAGE = 6

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

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

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
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
      
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      setError(error.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

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

    return filtered.sort((a, b) => {
      // If searching, prioritize title matches
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const aTitleMatch = a.title?.toLowerCase().includes(query)
        const bTitleMatch = b.title?.toLowerCase().includes(query)
        
        if (aTitleMatch && !bTitleMatch) return -1
        if (!aTitleMatch && bTitleMatch) return 1
      }
      
      const aRating = a.ratingStats?.averageRating || a.averageRating || 0
      const bRating = b.ratingStats?.averageRating || b.averageRating || 0
      
      if (aRating !== bRating) {
        return bRating - aRating
      }
      
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [courses, selectedCategory, searchQuery])

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
    
    // Category stuff
    selectedCategory,
    categories,
    courseStats,
    
    // Search
    searchQuery,
    
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
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handleRetry
  }
}