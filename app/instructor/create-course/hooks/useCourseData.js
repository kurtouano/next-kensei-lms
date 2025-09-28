// hooks/useCourseData.js - Updated to support pre-filling data
import { useState, useCallback } from "react"

// Default course data structure
const initialCourseData = {
  slug: "",
  title: "",
  fullDescription: "",
  shortDescription: "",
  level: "",
  highlights: [{ description: "" }],
  thumbnail: "",
  previewVideoUrl: "", 
  price: 0,
  creditReward: 0,
  randomReward: true,
  randomItemCount: 2,
  tags: [""],
  isPublished: false,
}

// Constants for limits
const LIMITS = {
  highlights: 4,
  tags: 5,
}

export const useCourseData = () => {
  const [courseData, setCourseData] = useState(initialCourseData)

  // Generate slug from title
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [])

  // Update single course data field
  const updateCourseData = useCallback((field, value) => {
    setCourseData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title') {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }, [generateSlug])

  // Update course array fields (highlights, tags, itemsReward)
  const updateCourseArray = useCallback((field, index, value, action = 'update') => {
    setCourseData(prev => {
      const array = [...prev[field]]
      
      switch (action) {
        case 'add':
          if (array.length >= LIMITS[field]) {
            alert(`Maximum ${LIMITS[field]} ${field} allowed`)
            return prev
          }
          return { ...prev, [field]: [...array, value] }
        
        case 'remove':
          return { ...prev, [field]: array.filter((_, i) => i !== index) }
        
        case 'update':
        default:
          array[index] = value
          return { ...prev, [field]: array }
      }
    })
  }, [])

  // NEW: Function to set all course data at once (for editing)
  const setCourseDataComplete = useCallback((data) => {
    setCourseData(data)
  }, [])

  return {
    courseData,
    updateCourseData,
    updateCourseArray,
    setCourseData: setCourseDataComplete, // Expose setCourseData for editing
    LIMITS,
    generateSlug
  }
}