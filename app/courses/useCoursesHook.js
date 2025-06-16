// hooks/useCourses.js
import { useState, useEffect, useCallback, useMemo } from 'react'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Categories
  const categories = useMemo(() => [
    { id: "all", name: "All Courses" },
    { id: "N5", name: "Beginner (N5)" },
    { id: "N4", name: "Elementary (N4)" },
    { id: "N3", name: "Intermediate (N3)" },
    { id: "N2", name: "Upper Intermediate (N2)" },
    { id: "N1", name: "Advanced (N1)" },
  ], [])

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

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = selectedCategory === "all" 
      ? courses.filter(course => course.isPublished !== false)
      : courses.filter((course) => {
          const matchesLevel = course.level === selectedCategory
          const matchesCategory = course.category === selectedCategory
          const isPublished = course.isPublished !== false
          
          return (matchesLevel || matchesCategory) && isPublished
        })

    return filtered.sort((a, b) => {
      const aRating = a.ratingStats?.averageRating || a.averageRating || 0
      const bRating = b.ratingStats?.averageRating || b.averageRating || 0
      
      if (aRating !== bRating) {
        return bRating - aRating
      }
      
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [courses, selectedCategory])

  // Course stats
  const courseStats = useMemo(() => ({
    total: courses.length,
    filtered: filteredAndSortedCourses.length,
    selectedCategoryName: categories.find(c => c.id === selectedCategory)?.name
  }), [courses.length, filteredAndSortedCourses.length, categories, selectedCategory])

  // Handlers
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
  }, [])

  const handleRetry = useCallback(() => {
    fetchCourses()
  }, [fetchCourses])

  // Fetch on mount
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    // Data
    courses: filteredAndSortedCourses,
    loading,
    error,
    
    // Category stuff
    selectedCategory,
    categories,
    courseStats,
    
    // Actions
    handleCategoryChange,
    handleRetry
  }
}
